# Railway Database Variable Reference

## How to Reference DATABASE_URL in Railway

If Railway automatically detects your PostgreSQL service, `DATABASE_URL` should be available automatically.

If not, here's how to reference it manually:

### Method 1: Service Variable Reference
1. In your `motogo-rd` service Variables tab
2. Click "+ New Variable"
3. Look for a dropdown or option that says "Reference" or "From Service"
4. Select the `Postgres` service
5. Select `DATABASE_URL` variable
6. Save

### Method 2: Check if it's auto-added
Railway sometimes automatically adds `DATABASE_URL` when you have a PostgreSQL service. Check your `motogo-rd` service variables - it might already be there!

### Method 3: If still not working
The DATABASE_URL might need to be manually copied from Postgres service and pasted into motogo-rd service as a regular variable.



