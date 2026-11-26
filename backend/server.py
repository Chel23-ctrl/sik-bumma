import os, uuid, bcrypt, jwt, logging
from enum import Enum
from datetime import datetime, timezone, timedelta
from typing import Optional, Any
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from mongomock_motor import AsyncMongoMockClient
from pydantic import BaseModel, Field

DB_NAME = os.environ.get('DB_NAME', 'bumma_db')
JWT_SECRET = os.environ.get('JWT_SECRET', 'bumma-mekar-sari-secret-2026')
MONGO_URI = os.environ.get('MONGO_URI') or os.environ.get('MONGODB_URI') or ''

# Gunakan MongoDB Atlas bila MONGO_URI dikonfigurasi (sinkronisasi multi-device),
# atau fallback ke in-memory mock untuk preview lokal.
if MONGO_URI.strip():
    client = AsyncIOMotorClient(MONGO_URI.strip())
    STORAGE_MODE = 'mongodb'
else:
    client = AsyncMongoMockClient()
    STORAGE_MODE = 'memory'

db = client[DB_NAME]

app = FastAPI(title='ARVÉA BUMKam Mekar Sari API', version='2.2.0')
api = APIRouter(prefix='/api')

# CORS aman lintas device & IP lokal: gunakan allow_origin_regex (bukan '*')
# agar allow_credentials=True tidak ditolak oleh Chrome/Safari/Edge.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r'^https?://.*$',
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
    expose_headers=['Authorization'],
)

def now(): return datetime.now(timezone.utc).isoformat()
def uid(prefix='id'): return f"{prefix}_{uuid.uuid4().hex[:10]}"
def rupiah(v): return int(float(v or 0))
def public(doc):
    if not doc: return None
    d = dict(doc); d.pop('_id', None); d.pop('password_hash', None); return d

def token(user):
    # Multi-device stateless JWT (jti unik per sesi, tanpa single-session lock)
    return jwt.encode(
        {
            'jti': uuid.uuid4().hex,
            'sub': user['id'],
            'username': user.get('username', user.get('email', '')),
            'email': user.get('email', ''),
            'role': user.get('role', 'Administrator'),
            'exp': datetime.now(timezone.utc) + timedelta(days=7)
        },
        JWT_SECRET,
        algorithm='HS256'
    )

def set_auth_cookie(response: Response, request: Request, jwt_token: str):
    # Deteksi otomatis HTTPS (Vercel/Render proxy) vs HTTP (IP lokal/localhost)
    forwarded_proto = (request.headers.get('x-forwarded-proto') or '').split(',')[0].strip().lower()
    is_https = forwarded_proto == 'https' or request.url.scheme == 'https'
    response.set_cookie(
        key='access_token',
        value=jwt_token,
        httponly=True,
        secure=is_https,
        samesite='none' if is_https else 'lax',
        path='/',
        max_age=86400 * 7
    )

def hash_password(raw: str) -> str:
    return bcrypt.hashpw(raw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(raw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(raw.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

async def current_user(request: Request):
    await seed_data()
    # Prioritaskan Bearer Token (kebal blokir cookie Safari/Chrome/IP lokal), fallback ke cookie
    auth_header = request.headers.get('Authorization', '').strip()
    bearer_val = auth_header[7:].strip() if auth_header.lower().startswith('bearer ') else ''
    val = bearer_val or request.cookies.get('access_token') or ''
    if not val:
        raise HTTPException(
            status_code=401,
            detail={'code': 'AUTH_REQUIRED', 'message': 'Silakan login terlebih dahulu.'}
        )
    try:
        payload = jwt.decode(val, JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={'code': 'SESSION_EXPIRED', 'message': 'Sesi login telah berakhir. Silakan masuk kembali.'}
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail={'code': 'INVALID_TOKEN', 'message': 'Token autentikasi tidak valid.'}
        )
    user = await db.users.find_one({'id': payload['sub']}, {'_id': 0})
    if not user:
        raise HTTPException(
            status_code=401,
            detail={'code': 'USER_NOT_FOUND', 'message': 'Pengguna tidak ditemukan.'}
        )
    # Route Guard 1: Cegat akun nonaktif (soft-disabled)
    if not user.get('is_active', True):
        raise HTTPException(
            status_code=403,
            detail={'code': 'ACCOUNT_DEACTIVATED', 'message': 'Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.'}
        )
    return user

async def require_password_changed(user=Depends(current_user)):
    # Route Guard 2: Cegat user yang wajib ubah kredensial awal (first-time login)
    if user.get('must_change_password', False) or user.get('password_changed_at') is None:
        raise HTTPException(
            status_code=403,
            detail={
                'code': 'MUST_CHANGE_PASSWORD',
                'message': 'Wajib ubah kredensial awal sebelum mengakses menu lain.'
            }
        )
    return user

# ============================================================================
# STANDARISASI 6 PERAN PENGGUNA (OFFICIAL ROLE & PERMISSION ENUM)
# ============================================================================
class UserRole(str, Enum):
    ADMINISTRATOR = 'Administrator'
    KETUA_BUMKAM = 'Ketua BUMKam'
    SEKRETARIS_BUMKAM = 'Sekretaris BUMKam'
    BENDAHARA_BUMKAM = 'Bendahara BUMKam'
    AUDITOR = 'Auditor'
    UMUM = 'Umum'

OFFICIAL_ROLES = [r.value for r in UserRole]

ROLE_PERMISSIONS = {
    UserRole.ADMINISTRATOR.value: [
        'dashboard', 'profil', 'pengguna', 'master', 'aset', 'landing_unit', 'transaksi',
        'kas_bank', 'jurnal', 'jurnal_penyesuaian', 'buku_besar', 'neraca_saldo', 'laporan',
        'analisis', 'operasional', 'penggajian'
    ],
    UserRole.KETUA_BUMKAM.value: [
        'dashboard', 'profil', 'aset', 'landing_unit', 'kas_bank', 'laporan', 'analisis', 'operasional'
    ],
    UserRole.SEKRETARIS_BUMKAM.value: [
        'dashboard', 'profil', 'aset', 'landing_unit', 'kas_bank', 'laporan', 'analisis', 'operasional'
    ],
    UserRole.BENDAHARA_BUMKAM.value: [
        'dashboard', 'master', 'aset', 'landing_unit', 'transaksi', 'kas_bank', 'jurnal',
        'buku_besar', 'neraca_saldo', 'laporan', 'analisis', 'operasional', 'penggajian'
    ],
    UserRole.AUDITOR.value: [
        'dashboard', 'profil', 'aset', 'landing_unit', 'jurnal', 'buku_besar', 'neraca_saldo', 'laporan'
    ],
    UserRole.UMUM.value: [
        'dashboard', 'profil', 'landing_unit', 'laporan'
    ]
}

LEGACY_ROLE_MAP = {
    'admin bumkam': UserRole.ADMINISTRATOR.value,
    'admin': UserRole.ADMINISTRATOR.value,
    'bendahara': UserRole.BENDAHARA_BUMKAM.value,
    'akuntansi': UserRole.BENDAHARA_BUMKAM.value,
    'keuangan': UserRole.BENDAHARA_BUMKAM.value,
    'manajer': UserRole.KETUA_BUMKAM.value,
    'publik': UserRole.UMUM.value,
}

def normalize_role(raw_role: Optional[str]) -> str:
    if not raw_role:
        return UserRole.UMUM.value
    cleaned = str(raw_role).strip()
    for r in OFFICIAL_ROLES:
        if r.lower() == cleaned.lower():
            return r
    return LEGACY_ROLE_MAP.get(cleaned.lower(), UserRole.UMUM.value)

def validate_official_role(raw_role: str) -> str:
    cleaned = str(raw_role or '').strip()
    for r in OFFICIAL_ROLES:
        if r.lower() == cleaned.lower():
            return r
    raise HTTPException(
        status_code=400,
        detail=f'Peran "{cleaned}" tidak valid. Pilih salah satu dari 6 peran resmi: {", ".join(OFFICIAL_ROLES)}.'
    )

async def require_admin(user=Depends(require_password_changed)):
    if normalize_role(user.get('role')) != UserRole.ADMINISTRATOR.value:
        raise HTTPException(403, 'Akses ditolak. Hanya Administrator yang diizinkan mengelola pengguna.')
    return user

READ_ONLY_ROLES = {UserRole.AUDITOR.value, UserRole.UMUM.value}
PROFILE_WRITE_ROLES = {
    UserRole.ADMINISTRATOR.value,
    UserRole.KETUA_BUMKAM.value,
    UserRole.SEKRETARIS_BUMKAM.value,
}

async def require_profile_write_access(user=Depends(require_password_changed)):
    role = normalize_role(user.get('role'))
    if role == UserRole.AUDITOR.value:
        raise HTTPException(status_code=403, detail='Role Auditor hanya memiliki hak akses baca')
    if role in READ_ONLY_ROLES or role not in PROFILE_WRITE_ROLES:
        raise HTTPException(
            status_code=403,
            detail=f'Akses ditolak. Role {role} tidak memiliki izin mengubah Profil BUMKam.'
        )
    return user

class LoginBody(BaseModel):
    email: str
    password: str

class InitialCredentialBody(BaseModel):
    new_username: Optional[str] = None
    new_password: str
    confirm_password: str

class CreateUserBody(BaseModel):
    full_name: str
    username: str
    email: str
    role: str = UserRole.SEKRETARIS_BUMKAM.value
    unit_kerja: str = 'BUMKam Mekar Sari'
    temp_password: str
    must_change_password: bool = True

class UpdateUserBody(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    unit_kerja: Optional[str] = None

class ResetPasswordBody(BaseModel):
    new_password: str
    must_change_password: bool = True

class ToggleStatusBody(BaseModel):
    is_active: bool

class RecordBody(BaseModel):
    data: dict[str, Any] = Field(default_factory=dict)

# Master Data Initial Constants
DEFAULT_ACCOUNTS = [
    {'id': 'acc_1001', 'code': '1001', 'name': 'Kas', 'category': 'Aset Lancar', 'type': 'asset', 'normal': 'Debit'},
    {'id': 'acc_1002', 'code': '1002', 'name': 'Bank Papua', 'category': 'Aset Lancar', 'type': 'asset', 'normal': 'Debit'},
    {'id': 'acc_1101', 'code': '1101', 'name': 'Piutang Usaha', 'category': 'Aset Lancar', 'type': 'asset', 'normal': 'Debit'},
    {'id': 'acc_1201', 'code': '1201', 'name': 'Persediaan Barang Dagang', 'category': 'Aset Lancar', 'type': 'asset', 'normal': 'Debit'},
    {'id': 'acc_1301', 'code': '1301', 'name': 'Perlengkapan Usaha', 'category': 'Aset Lancar', 'type': 'asset', 'normal': 'Debit'},
    {'id': 'acc_1501', 'code': '1501', 'name': 'Aset Tetap & Peralatan', 'category': 'Aset Tetap', 'type': 'asset', 'normal': 'Debit'},
    {'id': 'acc_1591', 'code': '1591', 'name': 'Akumulasi Penyusutan', 'category': 'Aset Tetap', 'type': 'asset', 'normal': 'Kredit'},
    {'id': 'acc_2001', 'code': '2001', 'name': 'Utang Usaha', 'category': 'Liabilitas', 'type': 'liability', 'normal': 'Kredit'},
    {'id': 'acc_2101', 'code': '2101', 'name': 'Utang Lainnya', 'category': 'Liabilitas', 'type': 'liability', 'normal': 'Kredit'},
    {'id': 'acc_2102', 'code': '2102', 'name': 'Beban yang Masih Harus Dibayar', 'category': 'Liabilitas', 'type': 'liability', 'normal': 'Kredit'},
    {'id': 'acc_2201', 'code': '2201', 'name': 'Pendapatan Diterima di Muka', 'category': 'Liabilitas', 'type': 'liability', 'normal': 'Kredit'},
    {'id': 'acc_3001', 'code': '3001', 'name': 'Modal BUMMA', 'category': 'Ekuitas', 'type': 'equity', 'normal': 'Kredit'},
    {'id': 'acc_3101', 'code': '3101', 'name': 'Saldo Laba Ditahan', 'category': 'Ekuitas', 'type': 'equity', 'normal': 'Kredit'},
    {'id': 'acc_4001', 'code': '4001', 'name': 'Pendapatan Penjualan Perdagangan', 'category': 'Pendapatan', 'type': 'revenue', 'normal': 'Kredit'},
    {'id': 'acc_4002', 'code': '4002', 'name': 'Pendapatan Jasa Penyewaan', 'category': 'Pendapatan', 'type': 'revenue', 'normal': 'Kredit'},
    {'id': 'acc_5001', 'code': '5001', 'name': 'Harga Pokok Penjualan (HPP)', 'category': 'Beban Pokok', 'type': 'expense', 'normal': 'Debit'},
    {'id': 'acc_5101', 'code': '5101', 'name': 'Beban Gaji Karyawan', 'category': 'Beban Operasional', 'type': 'expense', 'normal': 'Debit'},
    {'id': 'acc_5102', 'code': '5102', 'name': 'Beban Listrik & Air', 'category': 'Beban Operasional', 'type': 'expense', 'normal': 'Debit'},
    {'id': 'acc_5103', 'code': '5103', 'name': 'Beban Transportasi & Logistik', 'category': 'Beban Operasional', 'type': 'expense', 'normal': 'Debit'},
    {'id': 'acc_5104', 'code': '5104', 'name': 'Beban Pemeliharaan & Operasional', 'category': 'Beban Operasional', 'type': 'expense', 'normal': 'Debit'},
    {'id': 'acc_5105', 'code': '5105', 'name': 'Beban Penyusutan Aset Tetap', 'category': 'Beban Operasional', 'type': 'expense', 'normal': 'Debit'},
    {'id': 'acc_5199', 'code': '5199', 'name': 'Beban Operasional Lainnya', 'category': 'Beban Operasional', 'type': 'expense', 'normal': 'Debit'}
]

DEFAULT_PRODUCTS = [
    {'id': 'prd_1', 'code': 'PRD-001', 'name': 'Telur Ayam Segar', 'category': 'Peternakan Ayam', 'unit_usaha': 'perdagangan', 'unit': 'rak', 'buy_price': 35000, 'sell_price': 70000, 'stock': 40, 'min_stock': 5},
    {'id': 'prd_2', 'code': 'PRD-002', 'name': 'Beras Lokal Papua', 'category': 'Produk Pertanian', 'unit_usaha': 'perdagangan', 'unit': 'kg', 'buy_price': 60000, 'sell_price': 120000, 'stock': 20, 'min_stock': 5},
    {'id': 'prd_3', 'code': 'PRD-003', 'name': 'Kerajinan Noken Asli', 'category': 'Kerajinan Lokal', 'unit_usaha': 'perdagangan', 'unit': 'pcs', 'buy_price': 125000, 'sell_price': 250000, 'stock': 10, 'min_stock': 2},
    {'id': 'prd_4', 'code': 'PRD-004', 'name': 'Pakan Ayam Petelur', 'category': 'Peternakan Ayam', 'unit_usaha': 'perdagangan', 'unit': 'karung', 'buy_price': 280000, 'sell_price': 560000, 'stock': 15, 'min_stock': 3},
    {'id': 'prd_5', 'code': 'PRD-005', 'name': 'Sewa Tenda Acara / Pesta', 'category': 'Jasa Penyewaan', 'unit_usaha': 'jasa', 'unit': 'hari', 'buy_price': 0, 'sell_price': 1000000, 'stock': 5, 'min_stock': 1},
    {'id': 'prd_6', 'code': 'PRD-006', 'name': 'Sewa Gedung Serba Guna', 'category': 'Jasa Penyewaan', 'unit_usaha': 'jasa', 'unit': 'acara', 'buy_price': 0, 'sell_price': 2000000, 'stock': 2, 'min_stock': 1}
]

DEFAULT_CUSTOMERS = [
    {'id': 'cus_1', 'name': 'Koperasi Masyarakat Mamta', 'phone': '0812-4000-1122', 'address': 'Kabupaten Jayapura', 'receivable': 0},
    {'id': 'cus_2', 'name': 'Toko Harapan Adat', 'phone': '0812-4000-2233', 'address': 'Sentani, Jayapura', 'receivable': 0},
    {'id': 'cus_3', 'name': 'Panitia Acara Kampung', 'phone': '0812-4000-3344', 'address': 'Distrik Nimboran', 'receivable': 0}
]

DEFAULT_SUPPLIERS = [
    {'id': 'sup_1', 'name': 'CV Sumber Pangan Mandiri', 'contact': '0813-5000-1122', 'bank_name': 'Bank Papua', 'bank_account': '101-020-3040', 'bank_holder': 'CV Sumber Pangan', 'address': 'Jayapura', 'payable': 0},
    {'id': 'sup_2', 'name': 'Kelompok Peternak Adat', 'contact': '0813-5000-2233', 'bank_name': 'Bank BRI', 'bank_account': '4567-01-002345-53-1', 'bank_holder': 'Markus Krey', 'address': 'Sentani', 'payable': 0}
]

DEFAULT_EMPLOYEES = [
    {'id': 'emp_1', 'nik': '9271000001', 'name': 'Eko L Wibowo', 'position': 'Direktur BUMKam', 'unit': 'BUMMA Mekar Sari', 'salary': 5000000, 'status': 'Aktif'},
    {'id': 'emp_2', 'nik': '9271000002', 'name': 'Rita Fanghoi', 'position': 'Bendahara BUMKam', 'unit': 'BUMMA Mekar Sari', 'salary': 4500000, 'status': 'Aktif'},
    {'id': 'emp_3', 'nik': '9271000003', 'name': 'Yohanis Wenda', 'position': 'Kepala Unit Perdagangan', 'unit': 'Unit Perdagangan & Peternakan', 'salary': 3800000, 'status': 'Aktif'},
    {'id': 'emp_4', 'nik': '9271000004', 'name': 'Markus Krey', 'position': 'Kepala Unit Jasa', 'unit': 'Unit Jasa Penyewaan', 'salary': 3800000, 'status': 'Aktif'}
]

DEFAULT_ASSETS = [
    {
        'id': 'ast_1',
        'inv_number': 'AST-0001',
        'product_code': 'PRD-007',
        'product_name': 'Mesin Penetas Telur Otomatis 500 Butir',
        'category': 'Peralatan Peternakan',
        'asset_type': 'Aset Tetap',
        'model_type': 'Individual',
        'unit_usaha': 'perdagangan',
        'brand': 'Inkubator Sentani Tech',
        'type_name': 'Super Hatch 500',
        'serial_number': 'SN-INC-2024-0089',
        'qty': 1,
        'unit': 'Unit',
        'unit_price': 7500000,
        'total_cost': 7500000,
        'acq_date': '2024-03-15',
        'acq_source': 'Pembelian',
        'useful_life': 5,
        'salvage_value': 500000,
        'deprec_method': 'Garis Lurus',
        'location': 'Tempat Produksi Kandang',
        'department': 'Unit Perdagangan & Peternakan',
        'pic': 'Yohanis Wenda',
        'condition': 'Baik',
        'status': 'Aktif/Digunakan',
        'notes': 'Kondisi prima, digunakan untuk penetasan bibit ayam petelur lokal'
    },
    {
        'id': 'ast_2',
        'inv_number': 'AST-0002',
        'product_code': 'PRD-008',
        'product_name': 'Komputer Administrasi Kantor',
        'category': 'Teknologi & Kantor',
        'asset_type': 'Aset Tetap',
        'model_type': 'Individual',
        'unit_usaha': 'perdagangan',
        'brand': 'Lenovo ThinkCentre',
        'type_name': 'M70s Gen 3 Core i5',
        'serial_number': 'SN-LNV-2024-7712',
        'qty': 1,
        'unit': 'Unit',
        'unit_price': 6500000,
        'total_cost': 6500000,
        'acq_date': '2024-01-10',
        'acq_source': 'Penyertaan Modal',
        'useful_life': 4,
        'salvage_value': 500000,
        'deprec_method': 'Garis Lurus',
        'location': 'Kantor BUMKam',
        'department': 'Unit Perdagangan & Peternakan',
        'pic': 'Rita Fanghoi',
        'condition': 'Baik',
        'status': 'Aktif/Digunakan',
        'notes': 'Komputer utama pencatatan aplikasi akuntansi SAK EMKM ARVEA'
    },
    {
        'id': 'ast_3',
        'inv_number': 'INV-0001',
        'product_code': 'PRD-010',
        'product_name': 'Kursi Lipat Acara / Pesta',
        'category': 'Perlengkapan Acara',
        'asset_type': 'Inventaris Operasional',
        'model_type': 'Kelompok',
        'unit_usaha': 'jasa',
        'brand': 'Futura',
        'type_name': 'Chitose Standard',
        'serial_number': '-',
        'qty': 150,
        'unit': 'Unit',
        'unit_price': 150000,
        'total_cost': 22500000,
        'acq_date': '2024-05-20',
        'acq_source': 'Pembelian',
        'useful_life': 0,
        'salvage_value': 0,
        'deprec_method': '-',
        'location': 'Gudang Tenda & Perlengkapan',
        'department': 'Unit Jasa Penyewaan',
        'pic': 'Markus Krey',
        'condition': 'Baik',
        'status': 'Aktif/Digunakan',
        'notes': '150 unit kursi sewa dalam kelompok, bersih dan siap pasang'
    },
    {
        'id': 'ast_4',
        'inv_number': 'INV-0002',
        'product_code': 'PRD-011',
        'product_name': 'Meja Persegi Acara / Pertemuan',
        'category': 'Perlengkapan Acara',
        'asset_type': 'Inventaris Operasional',
        'model_type': 'Kelompok',
        'unit_usaha': 'jasa',
        'brand': 'Olympic Adat',
        'type_name': 'Meja Lipat 120x60',
        'serial_number': '-',
        'qty': 20,
        'unit': 'Unit',
        'unit_price': 450000,
        'total_cost': 9000000,
        'acq_date': '2024-06-12',
        'acq_source': 'Pembelian',
        'useful_life': 0,
        'salvage_value': 0,
        'deprec_method': '-',
        'location': 'Gudang Tenda & Perlengkapan',
        'department': 'Unit Jasa Penyewaan',
        'pic': 'Markus Krey',
        'condition': 'Baik',
        'status': 'Aktif/Digunakan',
        'notes': 'Meja operasional acara sewa warga kampung'
    }
]

DEFAULT_PROFILE = {
    'id': 'profile',
    'name': 'BUMMA MEKAR SARI',
    'legal_name': 'Badan Usaha Milik Masyarakat Adat Mekar Sari',
    'region': 'Wilayah Adat Mamta',
    'location': 'Kabupaten Jayapura, Papua',
    'address': 'Jl. Raya Adat Mamta No. 12, Sentani, Kabupaten Jayapura',
    'phone': '0812-4000-1122',
    'email': 'bummamekarsari@gmail.com',
    'director': 'Eko L Wibowo',
    'treasurer': 'Rita Fanghoi',
    'bank_name': 'Bank Papua',
    'bank_account': '100-01-02-03040-5',
    'bank_holder': 'BUMMA MEKAR SARI',
    'business_units': [
        {'id': 'perdagangan', 'name': 'Unit Perdagangan & Peternakan', 'type': 'Perdagangan', 'desc': 'Peternakan Ayam Petelur & Komoditas Hasil Bumi'},
        {'id': 'jasa', 'name': 'Unit Jasa Penyewaan', 'type': 'Jasa', 'desc': 'Penyewaan Tenda Acara & Gedung Serba Guna BUMMA'}
    ]
}

DEFAULT_INITIAL_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'BummaMekarSari2026!')

DEMO_USERS = [
    {
        'id': 'usr_admin',
        'full_name': 'Administrator ARVEA',
        'name': 'Administrator ARVEA',
        'username': 'administrator',
        'email': 'admin@arvea-mekarsari.id',
        'role': 'Administrator',
        'unit_kerja': 'Kantor Pengelola BUMKam',
        'initials': 'AD',
        'is_active': True,
        'must_change_password': True,
        'password_changed_at': None,
        'is_default_account': True
    },
    {
        'id': 'usr_ketua',
        'full_name': 'Eko L Wibowo',
        'name': 'Eko L Wibowo',
        'username': 'ketua_bumkam',
        'email': 'ketua@arvea-mekarsari.id',
        'role': 'Ketua BUMKam',
        'unit_kerja': 'BUMKam Mekar Sari',
        'initials': 'KB',
        'is_active': True,
        'must_change_password': False,
        'password_changed_at': '2026-01-15T08:00:00+00:00',
        'is_default_account': False
    },
    {
        'id': 'usr_sekretaris',
        'full_name': 'Sekretaris BUMKam',
        'name': 'Sekretaris BUMKam',
        'username': 'sekretaris_bumkam',
        'email': 'sekretaris@arvea-mekarsari.id',
        'role': 'Sekretaris BUMKam',
        'unit_kerja': 'Kantor Pengelola BUMKam',
        'initials': 'SB',
        'is_active': True,
        'must_change_password': False,
        'password_changed_at': '2026-01-15T08:00:00+00:00',
        'is_default_account': False
    },
    {
        'id': 'usr_bendahara',
        'full_name': 'Rita Fanghoi',
        'name': 'Rita Fanghoi',
        'username': 'bendahara_bumkam',
        'email': 'bendahara@arvea-mekarsari.id',
        'role': UserRole.BENDAHARA_BUMKAM.value,
        'unit_kerja': 'Keuangan & Akuntansi',
        'initials': 'BB',
        'is_active': True,
        'must_change_password': False,
        'password_changed_at': '2026-01-15T08:00:00+00:00',
        'is_default_account': False
    },
    {
        'id': 'usr_auditor',
        'full_name': 'Auditor Pengawas',
        'name': 'Auditor Pengawas',
        'username': 'auditor',
        'email': 'auditor@arvea-mekarsari.id',
        'role': UserRole.AUDITOR.value,
        'unit_kerja': 'Pengawas Independen',
        'initials': 'AU',
        'is_active': True,
        'must_change_password': False,
        'password_changed_at': '2026-01-15T08:00:00+00:00',
        'is_default_account': False
    },
    {
        'id': 'usr_umum',
        'full_name': 'Masyarakat & Publik',
        'name': 'Masyarakat & Publik',
        'username': 'umum',
        'email': 'publik@arvea-mekarsari.id',
        'role': UserRole.UMUM.value,
        'unit_kerja': 'Transparansi Kampung',
        'initials': 'UM',
        'is_active': True,
        'must_change_password': False,
        'password_changed_at': '2026-01-15T08:00:00+00:00',
        'is_default_account': False
    }
]

async def seed_data():
    if await db.users.count_documents({}) == 0:
        default_hash = hash_password(DEFAULT_INITIAL_PASSWORD)
        seed_docs = [
            {**u, 'password_hash': default_hash, 'created_at': now(), 'updated_at': now(), 'deactivated_at': None}
            for u in DEMO_USERS
        ]
        await db.users.insert_many(seed_docs)
    else:
        # Bersihkan akun role lama "Unit Perdagangan" & "Unit Jasa" serta normalisasi nama role Bendahara
        await db.users.delete_many({
            '$or': [
                {'id': {'$in': ['usr_perdagangan', 'usr_jasa']}},
                {'username': {'$in': ['unit_perdagangan', 'unit_jasa']}},
                {'role': {'$in': ['Pengurus Unit Perdagangan', 'Pengurus Unit Jasa', 'Unit Perdagangan', 'Unit Jasa']}}
            ]
        })
        await db.users.update_many(
            {'role': 'Bendahara'},
            {'$set': {'role': UserRole.BENDAHARA_BUMKAM.value, 'updated_at': now()}}
        )
    if await db.accounts.count_documents({}) == 0:
        await db.accounts.insert_many(DEFAULT_ACCOUNTS)
    if await db.products.count_documents({}) == 0:
        await db.products.insert_many(DEFAULT_PRODUCTS)
    if await db.customers.count_documents({}) == 0:
        await db.customers.insert_many(DEFAULT_CUSTOMERS)
    if await db.suppliers.count_documents({}) == 0:
        await db.suppliers.insert_many(DEFAULT_SUPPLIERS)
    if await db.employees.count_documents({}) == 0:
        await db.employees.insert_many(DEFAULT_EMPLOYEES)
    if await db.assets.count_documents({}) == 0:
        await db.assets.insert_many(DEFAULT_ASSETS)
    if await db.adjusting_journals.count_documents({}) == 0:
        for aje in DEFAULT_ADJUSTING_JOURNALS:
            header = {k: v for k, v in aje.items() if k != 'lines'}
            await db.adjusting_journals.insert_one(header)
            line_docs = [
                {
                    'id': uid('ajel'),
                    'adjusting_journal_id': aje['id'],
                    'unit_usaha': aje['unit_usaha'],
                    'line_no': idx + 1,
                    **line
                }
                for idx, line in enumerate(aje['lines'])
            ]
            if line_docs:
                await db.adjusting_journal_lines.insert_many(line_docs)
            if aje.get('status') == 'Posted':
                await sync_aje_to_ledger(aje)
    if await db.profile.count_documents({}) == 0:
        await db.profile.insert_one(DEFAULT_PROFILE)

@api.get('/health')
async def health_check():
    return {'ok': True, 'storage': STORAGE_MODE, 'multi_device': True}

@api.get('/auth/roles')
async def list_official_roles():
    return {
        'roles': OFFICIAL_ROLES,
        'permissions': ROLE_PERMISSIONS
    }

@api.post('/auth/login')
async def login(body: LoginBody, request: Request, response: Response):
    await seed_data()
    ident = (body.email or '').strip().lower()
    pwd = (body.password or '').strip()

    if not ident or not pwd:
        raise HTTPException(
            status_code=400,
            detail={'code': 'MISSING_CREDENTIALS', 'message': 'Username/email dan kata sandi wajib diisi.'}
        )

    found = await db.users.find_one(
        {'$or': [{'username': ident}, {'email': ident}]},
        {'_id': 0}
    )
    if not found and ident in ('admin', 'admin_bumma', 'admin@bumma.local', 'admin@bumma-demo.id'):
        found = await db.users.find_one({'id': 'usr_admin'}, {'_id': 0})

    if not found:
        raise HTTPException(
            status_code=401,
            detail={'code': 'USER_NOT_FOUND', 'message': 'Username atau email tidak ditemukan.'}
        )

    # Tolak akun yang sudah dinonaktifkan (soft-disabled)
    if not found.get('is_active', True):
        raise HTTPException(
            status_code=403,
            detail={'code': 'ACCOUNT_DEACTIVATED', 'message': 'Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.'}
        )

    # Verifikasi kata sandi tersimpan (hash bcrypt)
    if not verify_password(pwd, found.get('password_hash', '')):
        raise HTTPException(
            status_code=401,
            detail={'code': 'INVALID_PASSWORD', 'message': 'Kata sandi tidak valid. Silakan periksa kembali huruf besar/kecil atau spasi.'}
        )

    t = token(found)
    set_auth_cookie(response, request, t)
    return {
        **public(found),
        'access_token': t,
        'storage_mode': STORAGE_MODE,
        'requires_password_change': bool(found.get('must_change_password') or found.get('password_changed_at') is None)
    }

@api.post('/auth/change-initial-credentials')
async def change_initial_credentials(body: InitialCredentialBody, request: Request, response: Response, user=Depends(current_user)):
    new_pwd = body.new_password.strip()
    confirm_pwd = body.confirm_password.strip()
    if len(new_pwd) < 8:
        raise HTTPException(400, 'Password baru minimal terdiri dari 8 karakter.')
    if new_pwd != confirm_pwd:
        raise HTTPException(400, 'Konfirmasi password baru tidak cocok.')
    if new_pwd.lower() == DEFAULT_INITIAL_PASSWORD.lower():
        raise HTTPException(400, 'Password baru tidak boleh sama dengan password bawaan sistem.')

    update_fields = {
        'password_hash': hash_password(new_pwd),
        'must_change_password': False,
        'password_changed_at': now(),
        'is_default_account': False,
        'updated_at': now()
    }

    if body.new_username and body.new_username.strip():
        clean_username = body.new_username.strip().lower()
        if len(clean_username) < 4:
            raise HTTPException(400, 'Username baru minimal 4 karakter.')
        dup = await db.users.find_one({'username': clean_username, 'id': {'$ne': user['id']}})
        if dup:
            raise HTTPException(409, f'Username "{clean_username}" sudah digunakan akun lain.')
        update_fields['username'] = clean_username

    await db.users.update_one({'id': user['id']}, {'$set': update_fields})
    updated = await db.users.find_one({'id': user['id']}, {'_id': 0})
    t = token(updated)
    set_auth_cookie(response, request, t)
    return {**public(updated), 'access_token': t, 'requires_password_change': False}

@api.get('/auth/me')
async def me(user=Depends(current_user)):
    return {
        **public(user),
        'requires_password_change': bool(user.get('must_change_password') or user.get('password_changed_at') is None)
    }

@api.post('/auth/logout')
async def logout(request: Request, response: Response):
    forwarded_proto = (request.headers.get('x-forwarded-proto') or '').split(',')[0].strip().lower()
    is_https = forwarded_proto == 'https' or request.url.scheme == 'https'
    response.delete_cookie('access_token', path='/', secure=is_https, samesite='none' if is_https else 'lax')
    return {'ok': True}

# ============================================================================
# USER MANAGEMENT (PENGELOLAAN PENGGUNA) CONTROLLER
# ============================================================================
@api.get('/users')
async def list_users(search: str = '', status: str = 'all', role: str = 'all', admin=Depends(require_admin)):
    all_users = await db.users.find({}, {'_id': 0}).sort('created_at', 1).to_list(500)
    sanitized = [public(u) for u in all_users]

    summary = {
        'total': len(sanitized),
        'active': sum(1 for u in sanitized if u.get('is_active', True)),
        'inactive': sum(1 for u in sanitized if not u.get('is_active', True)),
        'must_change_password': sum(1 for u in sanitized if u.get('must_change_password') or not u.get('password_changed_at'))
    }

    filtered = sanitized
    if status == 'active':
        filtered = [u for u in filtered if u.get('is_active', True)]
    elif status == 'inactive':
        filtered = [u for u in filtered if not u.get('is_active', True)]

    if role and role != 'all':
        filtered = [u for u in filtered if u.get('role') == role]

    if search.strip():
        q = search.strip().lower()
        filtered = [
            u for u in filtered
            if q in str(u.get('full_name', '')).lower()
            or q in str(u.get('username', '')).lower()
            or q in str(u.get('email', '')).lower()
            or q in str(u.get('role', '')).lower()
            or q in str(u.get('unit_kerja', '')).lower()
        ]

    return {'items': filtered, 'summary': summary}

@api.post('/users')
async def create_user(body: CreateUserBody, admin=Depends(require_admin)):
    username = body.username.strip().lower()
    email = body.email.strip().lower()
    if len(username) < 4:
        raise HTTPException(400, 'Username minimal 4 karakter.')
    if len(body.temp_password.strip()) < 6:
        raise HTTPException(400, 'Password sementara minimal 6 karakter.')

    dup = await db.users.find_one({'$or': [{'username': username}, {'email': email}]})
    if dup:
        raise HTTPException(409, 'Username atau email sudah terdaftar.')

    valid_role = validate_official_role(body.role)
    parts = [p for p in body.full_name.strip().split(' ') if p]
    initials = (parts[0][0] + (parts[1][0] if len(parts) > 1 else parts[0][1:2])).upper() if parts else 'US'

    new_doc = {
        'id': uid('usr'),
        'full_name': body.full_name.strip(),
        'name': body.full_name.strip(),
        'username': username,
        'email': email,
        'role': valid_role,
        'unit_kerja': body.unit_kerja.strip() or 'BUMKam Mekar Sari',
        'initials': initials[:2],
        'password_hash': hash_password(body.temp_password.strip()),
        'is_active': True,
        'must_change_password': bool(body.must_change_password),
        'password_changed_at': None if body.must_change_password else now(),
        'is_default_account': False,
        'created_at': now(),
        'updated_at': now(),
        'deactivated_at': None
    }
    await db.users.insert_one(new_doc)
    return public(new_doc)

@api.put('/users/{user_id}')
async def update_user(user_id: str, body: UpdateUserBody, admin=Depends(require_admin)):
    target = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not target:
        raise HTTPException(404, 'Akun pengguna tidak ditemukan.')

    updates = {'updated_at': now()}
    if body.full_name is not None and body.full_name.strip():
        updates['full_name'] = body.full_name.strip()
        updates['name'] = body.full_name.strip()
    if body.username is not None and body.username.strip():
        uname = body.username.strip().lower()
        dup = await db.users.find_one({'username': uname, 'id': {'$ne': user_id}})
        if dup:
            raise HTTPException(409, f'Username "{uname}" sudah digunakan.')
        updates['username'] = uname
    if body.email is not None and body.email.strip():
        em = body.email.strip().lower()
        dup = await db.users.find_one({'email': em, 'id': {'$ne': user_id}})
        if dup:
            raise HTTPException(409, f'Email "{em}" sudah digunakan.')
        updates['email'] = em
    if body.role is not None and body.role.strip():
        updates['role'] = validate_official_role(body.role)
    if body.unit_kerja is not None and body.unit_kerja.strip():
        updates['unit_kerja'] = body.unit_kerja.strip()

    await db.users.update_one({'id': user_id}, {'$set': updates})
    updated = await db.users.find_one({'id': user_id}, {'_id': 0})
    return public(updated)

@api.post('/users/{user_id}/reset-password')
async def reset_user_password(user_id: str, body: ResetPasswordBody, admin=Depends(require_admin)):
    target = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not target:
        raise HTTPException(404, 'Akun pengguna tidak ditemukan.')
    new_pwd = body.new_password.strip()
    if len(new_pwd) < 6:
        raise HTTPException(400, 'Password baru sementara minimal 6 karakter.')

    await db.users.update_one(
        {'id': user_id},
        {'$set': {
            'password_hash': hash_password(new_pwd),
            'must_change_password': bool(body.must_change_password),
            'password_changed_at': None if body.must_change_password else now(),
            'is_default_account': False,
            'updated_at': now()
        }}
    )
    updated = await db.users.find_one({'id': user_id}, {'_id': 0})
    return {
        'ok': True,
        'message': 'Password berhasil diperbarui',
        **public(updated)
    }

@api.patch('/users/{user_id}/status')
async def toggle_user_status(user_id: str, body: ToggleStatusBody, admin=Depends(require_admin)):
    target = await db.users.find_one({'id': user_id}, {'_id': 0})
    if not target:
        raise HTTPException(404, 'Akun pengguna tidak ditemukan.')
    if user_id == admin['id'] and not body.is_active:
        raise HTTPException(400, 'Anda tidak dapat menonaktifkan akun yang sedang digunakan login.')

    if not body.is_active and normalize_role(target.get('role')) == UserRole.ADMINISTRATOR.value:
        active_admins = await db.users.count_documents({
            'role': UserRole.ADMINISTRATOR.value,
            'is_active': True,
            'id': {'$ne': user_id}
        })
        if active_admins == 0:
            raise HTTPException(400, 'Minimal harus ada 1 akun Administrator aktif di sistem.')

    # Soft-disable (is_active = False): riwayat transaksi & audit tetap aman
    await db.users.update_one(
        {'id': user_id},
        {'$set': {
            'is_active': bool(body.is_active),
            'deactivated_at': None if body.is_active else now(),
            'updated_at': now()
        }}
    )
    updated = await db.users.find_one({'id': user_id}, {'_id': 0})
    return public(updated)

@api.put('/users/me/profile')
async def update_my_profile(body: UpdateUserBody, user=Depends(require_password_changed)):
    updates = {'updated_at': now()}
    if body.full_name and body.full_name.strip():
        updates['full_name'] = body.full_name.strip()
        updates['name'] = body.full_name.strip()
    if body.email and body.email.strip():
        em = body.email.strip().lower()
        dup = await db.users.find_one({'email': em, 'id': {'$ne': user['id']}})
        if dup:
            raise HTTPException(409, 'Email sudah digunakan akun lain.')
        updates['email'] = em
    await db.users.update_one({'id': user['id']}, {'$set': updates})
    updated = await db.users.find_one({'id': user['id']}, {'_id': 0})
    return public(updated)

@api.get('/profile')
async def get_profile():
    await seed_data()
    prof = await db.profile.find_one({'id': 'profile'}, {'_id': 0})
    return prof or DEFAULT_PROFILE

@api.put('/profile')
async def update_profile(body: RecordBody, user=Depends(require_profile_write_access)):
    data = body.data
    await db.profile.update_one({'id': 'profile'}, {'$set': data}, upsert=True)
    prof = await db.profile.find_one({'id': 'profile'}, {'_id': 0})
    return prof

@api.get('/transactions')
async def list_transactions():
    txs = await db.transactions.find({}, {'_id': 0}).sort('created_at', -1).to_list(1000)
    return txs

@api.post('/transactions')
async def create_transaction(body: RecordBody, user=Depends(require_password_changed)):
    data = body.data
    tx_type = data.get('type', 'penjualan')
    cnt = await db.transactions.count_documents({}) + 1
    num = f"TX-{datetime.now().year}-{cnt:04d}"
    tx_id = uid('tx')
    date_val = data.get('date', now()[:10])
    total = rupiah(data.get('total', 0))

    item = {
        'id': tx_id,
        'number': num,
        'type': tx_type,
        'date': date_val,
        'unit_usaha': data.get('unit_usaha', 'perdagangan'),
        'contact_name': data.get('contact_name', ''),
        'product_name': data.get('product_name', ''),
        'quantity': int(data.get('quantity', 1)),
        'price': rupiah(data.get('price', total)),
        'total': total,
        'payment_method': data.get('payment_method', 'Tunai'),
        'description': data.get('description', ''),
        'created_at': now()
    }
    await db.transactions.insert_one(item)

    # Automatic Journal Entry
    jcnt = await db.journals.count_documents({}) + 1
    jrn_num = f"JRN-{datetime.now().year}-{jcnt:04d}"
    jrn_lines = []
    if tx_type == 'penjualan':
        debit_acc = '1001' if item['payment_method'] == 'Tunai' else '1101'
        rev_acc = '4001' if item['unit_usaha'] == 'perdagangan' else '4002'
        jrn_lines = [
            {'account_code': debit_acc, 'account_name': 'Kas' if debit_acc == '1001' else 'Piutang Usaha', 'debit': total, 'credit': 0},
            {'account_code': rev_acc, 'account_name': 'Pendapatan Penjualan' if rev_acc == '4001' else 'Pendapatan Jasa', 'debit': 0, 'credit': total}
        ]
    elif tx_type == 'pembelian':
        credit_acc = '1001' if item['payment_method'] == 'Tunai' else '2001'
        jrn_lines = [
            {'account_code': '1201', 'account_name': 'Persediaan Barang Dagang', 'debit': total, 'credit': 0},
            {'account_code': credit_acc, 'account_name': 'Kas' if credit_acc == '1001' else 'Utang Usaha', 'debit': 0, 'credit': total}
        ]
    elif tx_type == 'kas_masuk':
        jrn_lines = [
            {'account_code': '1001', 'account_name': 'Kas', 'debit': total, 'credit': 0},
            {'account_code': data.get('account_code', '3001'), 'account_name': data.get('account_name', 'Modal / Penerimaan'), 'debit': 0, 'credit': total}
        ]
    elif tx_type == 'kas_keluar':
        jrn_lines = [
            {'account_code': data.get('account_code', '5102'), 'account_name': data.get('account_name', 'Beban Operasional'), 'debit': total, 'credit': 0},
            {'account_code': '1001', 'account_name': 'Kas', 'debit': 0, 'credit': total}
        ]

    if jrn_lines:
        jrn_entry = {
            'id': uid('jrn'),
            'number': jrn_num,
            'reference': num,
            'date': date_val,
            'description': item['description'] or f"Transaksi {tx_type.capitalize()} {item['product_name']}",
            'lines': jrn_lines,
            'created_at': now()
        }
        await db.journals.insert_one(jrn_entry)

    return public(item)

@api.get('/journals')
async def list_journals():
    jrns = await db.journals.find({}, {'_id': 0}).sort('date', 1).to_list(1000)
    running_balance = 0
    flat_rows = []
    for j in jrns:
        for line in j.get('lines', []):
            d = rupiah(line.get('debit', 0))
            k = rupiah(line.get('credit', 0))
            running_balance += (d - k)
            flat_rows.append({
                'id': j.get('id'),
                'number': j.get('number'),
                'reference': j.get('reference'),
                'date': j.get('date'),
                'description': j.get('description'),
                'account_code': line.get('account_code'),
                'account_name': line.get('account_name'),
                'debit': d,
                'credit': k,
                'balance': running_balance
            })
    return {'entries': jrns, 'rows': flat_rows}

VALID_ASSET_UNITS = {'perdagangan', 'jasa'}

def normalize_asset_unit(raw_unit: Optional[str]) -> str:
    val = (raw_unit or '').strip().lower()
    if val in ('perdagangan', 'unit perdagangan'):
        return 'perdagangan'
    if val in ('jasa', 'unit jasa'):
        return 'jasa'
    return ''

def summarize_assets(rows: list[dict[str, Any]]) -> dict[str, Any]:
    def calc(subset):
        return {
            'records': len(subset),
            'total_units': sum(int(x.get('qty', 1) or 1) for x in subset),
            'total_value': sum(rupiah(x.get('total_cost', 0)) for x in subset)
        }
    perdagangan = [x for x in rows if normalize_asset_unit(x.get('unit_usaha')) == 'perdagangan']
    jasa = [x for x in rows if normalize_asset_unit(x.get('unit_usaha')) == 'jasa']
    return {
        'all': calc(rows),
        'perdagangan': calc(perdagangan),
        'jasa': calc(jasa)
    }

@api.get('/assets')
async def list_assets(unit: str = 'all', search: str = ''):
    await seed_data()
    all_assets = await db.assets.find({}, {'_id': 0}).to_list(1000)
    summary = summarize_assets(all_assets)

    unit_filter = (unit or 'all').strip().lower()
    filtered = all_assets
    if unit_filter in VALID_ASSET_UNITS:
        filtered = [a for a in filtered if normalize_asset_unit(a.get('unit_usaha')) == unit_filter]

    q = (search or '').strip().lower()
    if q:
        filtered = [
            a for a in filtered
            if q in str(a.get('inv_number', '')).lower()
            or q in str(a.get('product_name', '')).lower()
            or q in str(a.get('product_code', '')).lower()
            or q in str(a.get('serial_number', '')).lower()
            or q in str(a.get('pic', '')).lower()
            or q in str(a.get('unit_usaha', '')).lower()
        ]

    return {'items': filtered, 'summary': summary}

@api.post('/assets')
async def create_asset(body: RecordBody, user=Depends(require_password_changed)):
    await seed_data()
    data = dict(body.data or {})
    unit_usaha = normalize_asset_unit(data.get('unit_usaha'))
    if unit_usaha not in VALID_ASSET_UNITS:
        raise HTTPException(400, 'Unit Usaha wajib dipilih (perdagangan atau jasa).')

    qty = max(1, int(data.get('qty', 1) or 1))
    unit_price = rupiah(data.get('unit_price', 0))
    item = {
        'id': uid('ast'),
        **data,
        'unit_usaha': unit_usaha,
        'department': data.get('department') or (
            'Unit Perdagangan & Peternakan' if unit_usaha == 'perdagangan' else 'Unit Jasa Penyewaan'
        ),
        'qty': qty,
        'unit_price': unit_price,
        'total_cost': qty * unit_price,
        'created_at': now()
    }
    await db.assets.insert_one(item)
    return public(item)

@api.put('/assets/{asset_id}')
async def update_asset(asset_id: str, body: RecordBody, user=Depends(require_password_changed)):
    await seed_data()
    data = dict(body.data or {})
    unit_usaha = normalize_asset_unit(data.get('unit_usaha'))
    if unit_usaha not in VALID_ASSET_UNITS:
        raise HTTPException(400, 'Unit Usaha wajib dipilih (perdagangan atau jasa).')

    qty = max(1, int(data.get('qty', 1) or 1))
    unit_price = rupiah(data.get('unit_price', 0))
    update_fields = {
        **data,
        'unit_usaha': unit_usaha,
        'qty': qty,
        'unit_price': unit_price,
        'total_cost': qty * unit_price,
        'updated_at': now()
    }
    update_fields.pop('id', None)
    result = await db.assets.update_one({'id': asset_id}, {'$set': update_fields})
    if result.matched_count == 0:
        raise HTTPException(404, 'Data aset tidak ditemukan.')
    updated = await db.assets.find_one({'id': asset_id}, {'_id': 0})
    return updated

@api.delete('/assets/{asset_id}')
async def delete_asset(asset_id: str, user=Depends(require_password_changed)):
    await seed_data()
    result = await db.assets.delete_one({'id': asset_id})
    if result.deleted_count == 0:
        raise HTTPException(404, 'Data aset tidak ditemukan.')
    return {'ok': True}

VALID_AJE_UNITS = {'perdagangan', 'jasa', 'kantor'}

DEFAULT_ADJUSTING_JOURNALS = [
    {
        'id': 'aje_seed_1',
        'reference_no': 'AJE-202611-001',
        'entry_date': '2026-11-30',
        'unit_usaha': 'perdagangan',
        'category': 'Beban Penyusutan Aset Tetap',
        'description': 'Penyesuaian beban penyusutan Mesin Penetas Telur Otomatis 500 Butir periode November 2026',
        'total_debit': 116667,
        'total_credit': 116667,
        'status': 'Posted',
        'created_by': 'Administrator ARVEA',
        'created_at': '2026-11-30T08:00:00+00:00',
        'lines': [
            {
                'account_code': '5105',
                'account_name': 'Beban Penyusutan Aset Tetap',
                'debit': 116667,
                'credit': 0,
                'line_memo': 'Penyusutan bulanan mesin penetas telur ((7.500.000 - 500.000) / 5 thn / 12 bln)'
            },
            {
                'account_code': '1591',
                'account_name': 'Akumulasi Penyusutan',
                'debit': 0,
                'credit': 116667,
                'line_memo': 'Akumulasi penyusutan peralatan peternakan November 2026'
            }
        ]
    },
    {
        'id': 'aje_seed_2',
        'reference_no': 'AJE-202611-002',
        'entry_date': '2026-11-30',
        'unit_usaha': 'jasa',
        'category': 'Pendapatan Diterima di Muka (Unit Jasa)',
        'description': 'Pengakuan pendapatan sewa Gedung Serbaguna yang telah selesai digunakan bulan November 2026',
        'total_debit': 2000000,
        'total_credit': 2000000,
        'status': 'Posted',
        'created_by': 'Rita Fanghoi',
        'created_at': '2026-11-30T09:00:00+00:00',
        'lines': [
            {
                'account_code': '2201',
                'account_name': 'Pendapatan Diterima di Muka',
                'debit': 2000000,
                'credit': 0,
                'line_memo': 'Reklasifikasi uang muka sewa gedung yang telah terealisasi'
            },
            {
                'account_code': '4002',
                'account_name': 'Pendapatan Jasa Penyewaan',
                'debit': 0,
                'credit': 2000000,
                'line_memo': 'Pengakuan pendapatan jasa penyewaan gedung serbaguna'
            }
        ]
    },
    {
        'id': 'aje_seed_3',
        'reference_no': 'AJE-202611-003',
        'entry_date': '2026-11-30',
        'unit_usaha': 'kantor',
        'category': 'Beban yang Masih Harus Dibayar (Accrued Expense)',
        'description': 'Akrual tagihan listrik & operasional kantor pengelola BUMKam bulan November 2026',
        'total_debit': 350000,
        'total_credit': 350000,
        'status': 'Draft',
        'created_by': 'Rita Fanghoi',
        'created_at': '2026-11-30T10:00:00+00:00',
        'lines': [
            {
                'account_code': '5102',
                'account_name': 'Beban Listrik & Air',
                'debit': 350000,
                'credit': 0,
                'line_memo': 'Beban listrik kantor BUMKam November 2026 belum dibayar'
            },
            {
                'account_code': '2102',
                'account_name': 'Beban yang Masih Harus Dibayar',
                'debit': 0,
                'credit': 350000,
                'line_memo': 'Utang beban listrik kantor pengelola jatuh tempo Desember 2026'
            }
        ]
    }
]

def normalize_aje_unit(raw_unit: Optional[str]) -> str:
    val = (raw_unit or '').strip().lower()
    if val in ('perdagangan', 'unit perdagangan'):
        return 'perdagangan'
    if val in ('jasa', 'unit jasa'):
        return 'jasa'
    if val in ('kantor', 'umum', 'kantor pengelola', 'kantor pengelola / umum'):
        return 'kantor'
    return ''

def validate_aje_payload(data: dict[str, Any]) -> tuple[str, list[dict[str, Any]], int, int]:
    unit_usaha = normalize_aje_unit(data.get('unit_usaha'))
    if unit_usaha not in VALID_AJE_UNITS:
        raise HTTPException(400, 'Unit Usaha wajib dipilih (perdagangan, jasa, atau kantor).')

    raw_lines = data.get('lines') or []
    if not isinstance(raw_lines, list) or len(raw_lines) < 2:
        raise HTTPException(400, 'Jurnal penyesuaian minimal harus memiliki 2 baris akun (Debit dan Kredit).')

    clean_lines = []
    total_debit = 0
    total_credit = 0
    for idx, line in enumerate(raw_lines):
        acc_code = str(line.get('account_code', '')).strip()
        acc_name = str(line.get('account_name', '')).strip()
        debit = rupiah(line.get('debit', 0))
        credit = rupiah(line.get('credit', 0))

        if not acc_code:
            raise HTTPException(400, f'Baris ke-{idx + 1}: Akun COA wajib dipilih.')
        if debit < 0 or credit < 0:
            raise HTTPException(400, f'Baris ke-{idx + 1}: Nominal Debit/Kredit tidak boleh negatif.')
        if debit == 0 and credit == 0:
            raise HTTPException(400, f'Baris ke-{idx + 1}: Isi nominal Debit atau Kredit lebih dari Rp 0.')
        if debit > 0 and credit > 0:
            raise HTTPException(400, f'Baris ke-{idx + 1}: Satu baris hanya boleh mengisi Debit atau Kredit saja.')

        total_debit += debit
        total_credit += credit
        clean_lines.append({
            'account_code': acc_code,
            'account_name': acc_name or acc_code,
            'debit': debit,
            'credit': credit,
            'line_memo': str(line.get('line_memo', '')).strip()
        })

    if total_debit <= 0 or total_debit != total_credit:
        raise HTTPException(
            400,
            f'Jurnal tidak seimbang (Unbalanced): Total Debit ({total_debit}) != Total Kredit ({total_credit}).'
        )

    return unit_usaha, clean_lines, total_debit, total_credit

async def sync_aje_to_ledger(aje_doc: dict[str, Any]):
    await db.journals.delete_many({'source_aje_id': aje_doc['id']})
    if aje_doc.get('status') != 'Posted':
        return
    jrn_entry = {
        'id': uid('jrn'),
        'source_aje_id': aje_doc['id'],
        'source_type': 'adjusting',
        'number': aje_doc['reference_no'],
        'reference': aje_doc['reference_no'],
        'date': aje_doc['entry_date'],
        'unit_usaha': aje_doc['unit_usaha'],
        'description': f"[AJE] {aje_doc['description']}",
        'lines': [
            {
                'account_code': l['account_code'],
                'account_name': l['account_name'],
                'debit': l['debit'],
                'credit': l['credit']
            }
            for l in aje_doc.get('lines', [])
        ],
        'created_at': now()
    }
    await db.journals.insert_one(jrn_entry)

async def hydrate_aje_list(headers: list[dict[str, Any]]) -> list[dict[str, Any]]:
    result = []
    for h in headers:
        lines = await db.adjusting_journal_lines.find(
            {'adjusting_journal_id': h['id']}, {'_id': 0}
        ).sort('line_no', 1).to_list(200)
        result.append({**h, 'lines': lines})
    return result

@api.get('/adjusting-journals')
async def list_adjusting_journals(
    unit: str = 'all',
    month: str = 'all',
    year: str = 'all',
    status: str = 'all',
    search: str = ''
):
    await seed_data()
    headers = await db.adjusting_journals.find({}, {'_id': 0}).sort('entry_date', -1).to_list(1000)
    all_items = await hydrate_aje_list(headers)

    summary = {
        'all': {'count': len(all_items), 'posted': sum(1 for x in all_items if x.get('status') == 'Posted'), 'total': sum(rupiah(x.get('total_debit', 0)) for x in all_items)},
        'perdagangan': {'count': sum(1 for x in all_items if x.get('unit_usaha') == 'perdagangan'), 'total': sum(rupiah(x.get('total_debit', 0)) for x in all_items if x.get('unit_usaha') == 'perdagangan')},
        'jasa': {'count': sum(1 for x in all_items if x.get('unit_usaha') == 'jasa'), 'total': sum(rupiah(x.get('total_debit', 0)) for x in all_items if x.get('unit_usaha') == 'jasa')},
        'kantor': {'count': sum(1 for x in all_items if x.get('unit_usaha') == 'kantor'), 'total': sum(rupiah(x.get('total_debit', 0)) for x in all_items if x.get('unit_usaha') == 'kantor')}
    }

    filtered = all_items
    unit_f = normalize_aje_unit(unit) if unit != 'all' else 'all'
    if unit_f in VALID_AJE_UNITS:
        filtered = [x for x in filtered if x.get('unit_usaha') == unit_f]
    if year and year not in ('all', 'Semua Tahun'):
        filtered = [x for x in filtered if str(x.get('entry_date', '')).startswith(str(year))]
    if month and month != 'all':
        m_pad = str(month).zfill(2)
        filtered = [x for x in filtered if str(x.get('entry_date', ''))[5:7] == m_pad]
    if status and status != 'all':
        filtered = [x for x in filtered if x.get('status') == status]
    if search.strip():
        q = search.strip().lower()
        filtered = [
            x for x in filtered
            if q in str(x.get('reference_no', '')).lower()
            or q in str(x.get('description', '')).lower()
            or q in str(x.get('category', '')).lower()
            or any(q in str(l.get('account_name', '')).lower() or q in str(l.get('account_code', '')).lower() for l in x.get('lines', []))
        ]

    return {'items': filtered, 'summary': summary}

@api.post('/adjusting-journals')
async def create_adjusting_journal(body: RecordBody, user=Depends(require_password_changed)):
    await seed_data()
    data = dict(body.data or {})
    unit_usaha, clean_lines, total_debit, total_credit = validate_aje_payload(data)

    entry_date = str(data.get('entry_date') or now()[:10])
    ym = entry_date[:7].replace('-', '')
    existing_cnt = await db.adjusting_journals.count_documents({'reference_no': {'$regex': f'^AJE-{ym}-'}})
    reference_no = str(data.get('reference_no') or f'AJE-{ym}-{existing_cnt + 1:03d}').strip()
    status_val = 'Posted' if data.get('status') == 'Posted' else 'Draft'

    aje_id = uid('aje')
    header = {
        'id': aje_id,
        'reference_no': reference_no,
        'entry_date': entry_date,
        'unit_usaha': unit_usaha,
        'category': str(data.get('category') or 'Penyesuaian Lainnya').strip(),
        'description': str(data.get('description') or '').strip(),
        'total_debit': total_debit,
        'total_credit': total_credit,
        'status': status_val,
        'posted_at': now() if status_val == 'Posted' else None,
        'created_by': user.get('name', 'Administrator'),
        'created_at': now(),
        'updated_at': now()
    }
    await db.adjusting_journals.insert_one(header)

    line_docs = [
        {
            'id': uid('ajel'),
            'adjusting_journal_id': aje_id,
            'unit_usaha': unit_usaha,
            'line_no': idx + 1,
            **line
        }
        for idx, line in enumerate(clean_lines)
    ]
    await db.adjusting_journal_lines.insert_many(line_docs)

    full_doc = {**public(header), 'lines': [public(l) for l in line_docs]}
    await sync_aje_to_ledger(full_doc)
    return full_doc

@api.put('/adjusting-journals/{aje_id}')
async def update_adjusting_journal(aje_id: str, body: RecordBody, user=Depends(require_password_changed)):
    await seed_data()
    existing = await db.adjusting_journals.find_one({'id': aje_id}, {'_id': 0})
    if not existing:
        raise HTTPException(404, 'Jurnal penyesuaian tidak ditemukan.')

    data = dict(body.data or {})
    unit_usaha, clean_lines, total_debit, total_credit = validate_aje_payload(data)
    status_val = 'Posted' if data.get('status') == 'Posted' else 'Draft'

    updated_header = {
        'reference_no': str(data.get('reference_no') or existing['reference_no']).strip(),
        'entry_date': str(data.get('entry_date') or existing['entry_date']),
        'unit_usaha': unit_usaha,
        'category': str(data.get('category') or existing.get('category', '')).strip(),
        'description': str(data.get('description') or '').strip(),
        'total_debit': total_debit,
        'total_credit': total_credit,
        'status': status_val,
        'posted_at': now() if status_val == 'Posted' else None,
        'updated_at': now()
    }
    await db.adjusting_journals.update_one({'id': aje_id}, {'$set': updated_header})
    await db.adjusting_journal_lines.delete_many({'adjusting_journal_id': aje_id})

    line_docs = [
        {
            'id': uid('ajel'),
            'adjusting_journal_id': aje_id,
            'unit_usaha': unit_usaha,
            'line_no': idx + 1,
            **line
        }
        for idx, line in enumerate(clean_lines)
    ]
    await db.adjusting_journal_lines.insert_many(line_docs)

    full_doc = {**existing, **updated_header, 'lines': [public(l) for l in line_docs]}
    await sync_aje_to_ledger(full_doc)
    return full_doc

@api.post('/adjusting-journals/{aje_id}/post')
async def post_adjusting_journal(aje_id: str, user=Depends(require_password_changed)):
    await seed_data()
    existing = await db.adjusting_journals.find_one({'id': aje_id}, {'_id': 0})
    if not existing:
        raise HTTPException(404, 'Jurnal penyesuaian tidak ditemukan.')
    lines = await db.adjusting_journal_lines.find({'adjusting_journal_id': aje_id}, {'_id': 0}).sort('line_no', 1).to_list(200)
    validate_aje_payload({**existing, 'lines': lines})

    await db.adjusting_journals.update_one(
        {'id': aje_id},
        {'$set': {'status': 'Posted', 'posted_at': now(), 'updated_at': now()}}
    )
    full_doc = {**existing, 'status': 'Posted', 'posted_at': now(), 'lines': lines}
    await sync_aje_to_ledger(full_doc)
    return full_doc

@api.delete('/adjusting-journals/{aje_id}')
async def delete_adjusting_journal(aje_id: str, user=Depends(require_password_changed)):
    await seed_data()
    res = await db.adjusting_journals.delete_one({'id': aje_id})
    if res.deleted_count == 0:
        raise HTTPException(404, 'Jurnal penyesuaian tidak ditemukan.')
    await db.adjusting_journal_lines.delete_many({'adjusting_journal_id': aje_id})
    await db.journals.delete_many({'source_aje_id': aje_id})
    return {'ok': True}

# Master Data Generic CRUD
@api.get('/master/{resource}')
async def get_master(resource: str):
    await seed_data()
    col = getattr(db, resource, None)
    if col is None: raise HTTPException(404, 'Sumber daya tidak ditemukan')
    items = await col.find({}, {'_id': 0}).to_list(1000)
    return items

@api.post('/master/{resource}')
async def add_master(resource: str, body: RecordBody, user=Depends(require_password_changed)):
    col = getattr(db, resource, None)
    if col is None: raise HTTPException(404, 'Sumber daya tidak ditemukan')
    item = {'id': uid(resource[:3]), **body.data}
    await col.insert_one(item)
    return public(item)

@api.delete('/master/{resource}/{item_id}')
async def delete_master(resource: str, item_id: str, user=Depends(require_password_changed)):
    col = getattr(db, resource, None)
    if col is None: raise HTTPException(404, 'Sumber daya tidak ditemukan')
    await col.delete_one({'id': item_id})
    return {'ok': True}

app.include_router(api)
