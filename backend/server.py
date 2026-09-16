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
    {'id': 'acc_3001', 'code': '3001', 'name': 'Modal BUMMA', 'category': 'Ekuitas', 'type': 'equity', 'normal': 'Kredit'},
    {'id': 'acc_3101', 'code': '3101', 'name': 'Saldo Laba Ditahan', 'category': 'Ekuitas', 'type': 'equity', 'normal': 'Kredit'},
    {'id': 'acc_4001', 'code': '4001', 'name': 'Pendapatan Penjualan Perdagangan', 'category': 'Pendapatan', 'type': 'revenue', 'normal': 'Kredit'},
    {'id': 'acc_4002', 'code': '4002', 'name': 'Pendapatan Jasa Penyewaan', 'category': 'Pendapatan', 'type': 'revenue', 'normal': 'Kredit'},
    {'id': 'acc_5001', 'code': '5001', 'name': 'Harga Pokok Penjualan (HPP)', 'category': 'Beban Pokok', 'type': 'expense', 'normal': 'Debit'},
    {'id': 'acc_5101', 'code': '5101', 'name': 'Beban Gaji Karyawan', 'category': 'Beban Operasional', 'type': 'expense', 'normal': 'Debit'},
    {'id': 'acc_5102', 'code': '5102', 'name': 'Beban Listrik & Air', 'category': 'Beban Operasional', 'type': 'expense', 'normal': 'Debit'},
    {'id': 'acc_5103', 'code': '5103', 'name': 'Beban Transportasi & Logistik', 'category': 'Beban Operasional', 'type': 'expense', 'normal': 'Debit'},
    {'id': 'acc_5104', 'code': '5104', 'name': 'Beban Pemeliharaan & Operasional', 'category': 'Beban Operasional', 'type': 'expense', 'normal': 'Debit'},
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
