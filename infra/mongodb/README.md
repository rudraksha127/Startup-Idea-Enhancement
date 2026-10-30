# MongoDB Infrastructure Specification

AgencyOS uses MongoDB 7.0+ as its authoritative persistence engine.
In production, MongoDB Atlas M10+ is provisioned with automated daily snapshot backups, IP access lists, and TLS encryption in transit.

## Local Development & Staging

Run via Docker:
```bash
docker run -d --name agencyos-mongo -p 27017:27017 -e MONGO_INITDB_DATABASE=agencyos mongo:7.0
```

