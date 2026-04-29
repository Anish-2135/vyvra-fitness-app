import bcrypt

def hash_password(plain_text_password: str) -> str:
    password_bytes = plain_text_password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_text_password: str, hashed_password: str) -> bool:
    password_bytes = plain_text_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)