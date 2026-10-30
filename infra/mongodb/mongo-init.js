// MongoDB Initializer for AgencyOS Local & Staging Clusters
db = db.getSiblingDB("agencyos");

db.createUser({
  user: "agencyos_app",
  pwd: "agencyos_secure_password_123",
  roles: [
    { role: "readWrite", db: "agencyos" },
    { role: "dbAdmin", db: "agencyos" }
  ]
});

print("AgencyOS MongoDB initialized successfully with app user.");

