# RugsCo ERP - Office Installation Guide

**IMPORTANT NOTE ON INSTALLATION**: 
Because this is an ERP (Enterprise Resource Planning) software, **you should NOT install this on every individual computer in your office.** 
If you install it on every computer separately, each computer will have its own isolated database. This means if one person adds a new product or updates a salary, the others will not see it!

### The Correct Way to Setup an ERP in an Office:
You need to pick **ONE** main computer (the "Server") in your office to run the software. All other computers will simply access the ERP using their Web Browser (Chrome, Edge, etc.) by navigating to the Server's IP address.

---

## Step 1: Setup the "Server" Computer
Pick one reliable computer in your office that is always turned on and connected to the office Wi-Fi/Network.

1. **Install Prerequisites**:
   - Install **Python 3.13** (Make sure to check "Add Python to PATH" during installation).
   - Install **Node.js** (LTS version).

2. **Start the Backend (Database/API)**:
   - Open a Terminal or Command Prompt on the Server computer.
   - Navigate to the `backend` folder: `cd path\to\rugs-erp\backend`
   - Run: `python -m pip install -r requirements.txt`
   - Run: `python -m uvicorn main:app --host 0.0.0.0 --port 8000`
   *(Leave this window open!)*

3. **Start the Frontend (User Interface)**:
   - Open a NEW Terminal or Command Prompt window.
   - Navigate to the `frontend` folder: `cd path\to\rugs-erp\frontend`
   - Run: `npm install`
   - Run: `npm run dev -- --host 0.0.0.0`
   *(Leave this window open!)*

4. **Find the Server's IP Address**:
   - Open a Command Prompt and type `ipconfig`.
   - Look for `IPv4 Address` (it will look something like `192.168.1.50`).

---

## Step 2: Access the ERP from ANY Office Computer
Now that the server is running, no one else needs to install anything! 

1. Go to any other computer or laptop in your office connected to the same Wi-Fi.
2. Open a web browser (Google Chrome, Edge).
3. Type in the Server's IP address followed by `:5173`. 
   - **Example:** `http://192.168.1.50:5173`
4. The ERP will load immediately, and everyone will be working on the exact same database!

---

### Default Login Credentials:
- **Admin**: admin@rugsco.com / admin123
- **HR**: tom@rugsco.com / pass123
- **Accountant**: sara@rugsco.com / pass123
