# forex-alert-backend
```
create folder environment and file .development
```

# env
```
NODE_ENV=development
PRIVATE_KEY=n@e#w$f%a^r&m*m(e)m_o+r1i2z3e4567890
MONGO_URI=mongodb://localhost:27017/forex_alert
COOKIE_SECURE=true
```

# Step remove product
```
1. unsubscribe all
api /socket/unsubscribe
2. remove product
3. unsubscribe all
api /socket/subscribe
```
