import os, uuid, bcrypt, jwt, logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Any
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from mongomock_motor import AsyncMongoMockClient
from pydantic import BaseModel, Field

DB_NAME = os.environ.get('DB_NAME', 'bumma_db')
JWT_SECRET = os.environ.get('JWT_SECRET', 'bumma-mekar-sari-secret-2026')
client = AsyncMongoMockClient()
db = client[DB_NAME]

app = FastAPI(title='SIK-BUMMA Mekar Sari API', version='2.0.0')
api = APIRouter(prefix='/api')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

def now(): return datetime.now(timezone.utc).isoformat()
def uid(prefix='id'): return f"{prefix}_{uuid.uuid4().hex[:10]}"
def rupiah(v): return int(float(v or 0))
def public(doc):
    if not doc: return None
    d = dict(doc); d.pop('_id', None); d.pop('password_hash', None); return d
def token(user):
    return jwt.encode({'sub': user['id'], 'email': user['email'], 'role': user.get('role', 'Administrator'), 'exp': datetime.now(timezone.utc)+timedelta(days=7)}, JWT_SECRET, algorithm='HS256')

async def current_user(request: Request):
    val = request.cookies.get('access_token') or request.headers.get('Authorization', '').replace('Bearer ', '')
    if not val: raise HTTPException(401, 'Silakan login terlebih dahulu.')
    try: payload = jwt.decode(val, JWT_SECRET, algorithms=['HS256'])
    except Exception: raise HTTPException(401, 'Sesi login telah berakhir.')
    user = await db.users.find_one({'id': payload['sub']}, {'_id': 0})
    if not user: raise HTTPException(401, 'Pengguna tidak ditemukan.')
    return user

class LoginBody(BaseModel):
    email: str
    password: str

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

DEMO_USERS = [
    {'id': 'usr_admin', 'email': 'admin_bumma', 'name': 'Pengelola BUMMA', 'role': 'Administrator'},
    {'id': 'usr_admin_demo', 'email': 'admin@bumma-demo.id', 'name': 'Pengelola BUMMA', 'role': 'Administrator'},
    {'id': 'usr_acc', 'email': 'accounting@bumma-demo.id', 'name': 'Rita Fanghoi', 'role': 'Akuntansi'},
    {'id': 'usr_fin', 'email': 'finance@bumma-demo.id', 'name': 'Lukas Wenda', 'role': 'Keuangan'},
    {'id': 'usr_sales', 'email': 'sales@bumma-demo.id', 'name': 'Yohanes Tabuni', 'role': 'Sales'},
    {'id': 'usr_pur', 'email': 'purchasing@bumma-demo.id', 'name': 'Markus Krey', 'role': 'Pembelian'},
    {'id': 'usr_wh', 'email': 'warehouse@bumma-demo.id', 'name': 'Silas Kogoya', 'role': 'Gudang'},
    {'id': 'usr_mgr', 'email': 'manager@bumma-demo.id', 'name': 'Eko L Wibowo', 'role': 'Manajer'},
    {'id': 'usr_aud', 'email': 'auditor@bumma-demo.id', 'name': 'Dra. Sarah Rumbiak', 'role': 'Auditor'}
]

async def seed_data():
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

@api.post('/auth/login')
async def login(body: LoginBody, response: Response):
    await seed_data()
    email = body.email.strip().lower()
    pwd = body.password.strip()

    valid_pwds = ['bummamekarsari2026!', 'bumma123!', 'admin123', 'admin']
    if pwd.lower() not in valid_pwds:
        raise HTTPException(401, 'Kata sandi tidak sesuai.')

    found = None
    for u in DEMO_USERS:
        if u['email'].lower() == email:
            found = u
            break
    if not found and email in ['admin', 'admin_bumma', 'admin@bumma.local', 'admin@bumma-demo.id']:
        found = DEMO_USERS[0]

    if not found:
        found = {'id': uid('usr'), 'email': email, 'name': email.split('@')[0].capitalize(), 'role': 'Staf Keuangan'}

    t = token(found)
    response.set_cookie('access_token', t, httponly=True, samesite='lax', max_age=86400*7)
    return public(found)

@api.get('/auth/me')
async def me(user=Depends(current_user)):
    return public(user)

@api.post('/auth/logout')
async def logout(response: Response):
    response.delete_cookie('access_token')
    return {'ok': True}

@api.get('/profile')
async def get_profile():
    await seed_data()
    prof = await db.profile.find_one({'id': 'profile'}, {'_id': 0})
    return prof or DEFAULT_PROFILE

@api.put('/profile')
async def update_profile(body: RecordBody, user=Depends(current_user)):
    data = body.data
    await db.profile.update_one({'id': 'profile'}, {'$set': data}, upsert=True)
    prof = await db.profile.find_one({'id': 'profile'}, {'_id': 0})
    return prof

@api.get('/transactions')
async def list_transactions():
    txs = await db.transactions.find({}, {'_id': 0}).sort('created_at', -1).to_list(1000)
    return txs

@api.post('/transactions')
async def create_transaction(body: RecordBody, user=Depends(current_user)):
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
async def create_asset(body: RecordBody, user=Depends(current_user)):
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
async def update_asset(asset_id: str, body: RecordBody, user=Depends(current_user)):
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
async def delete_asset(asset_id: str, user=Depends(current_user)):
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
async def create_adjusting_journal(body: RecordBody, user=Depends(current_user)):
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
async def update_adjusting_journal(aje_id: str, body: RecordBody, user=Depends(current_user)):
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
async def post_adjusting_journal(aje_id: str, user=Depends(current_user)):
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
async def delete_adjusting_journal(aje_id: str, user=Depends(current_user)):
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
async def add_master(resource: str, body: RecordBody, user=Depends(current_user)):
    col = getattr(db, resource, None)
    if col is None: raise HTTPException(404, 'Sumber daya tidak ditemukan')
    item = {'id': uid(resource[:3]), **body.data}
    await col.insert_one(item)
    return public(item)

@api.delete('/master/{resource}/{item_id}')
async def delete_master(resource: str, item_id: str, user=Depends(current_user)):
    col = getattr(db, resource, None)
    if col is None: raise HTTPException(404, 'Sumber daya tidak ditemukan')
    await col.delete_one({'id': item_id})
    return {'ok': True}

app.include_router(api)
