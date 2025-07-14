# Microservices Deployment with Ansible on AWS

This project demonstrates deploying microservices using **AWS EC2, Ansible, Docker, Docker Compose, and Nginx** as a reverse proxy.

---

## 🚀 Features

- **AWS EC2** for hosting services
- **Ansible** for automated deployment
- **Docker & Docker Compose** for containerized services
- **Nginx** for reverse proxy
- **Node.js & Python microservices**

---

## 📌 Prerequisites

1. **AWS Account**
2. **Ansible installed** on your local machine
3. **SSH Key Pair (****`ansible-key.pem`****)** to connect to EC2
4. **Git installed**

---

## 🔥 Step-by-Step Deployment Guide

### **1️⃣ Create an EC2 Instance on AWS**

1. **Launch an EC2 instance** (Ubuntu 22.04, `t2.micro`).
2. **Security Group Configuration:**
   - SSH (22) → Your IP
   - HTTP (80) → Open to all
   - Custom TCP (3000, 5000) → Open to all
3. **Connect to EC2:**
   ```sh
   ssh -i ansible-key.pem ubuntu@<EC2_PUBLIC_IP>
   ```

### **2️⃣ Install Ansible on Your Local Machine**

```sh
sudo apt update
sudo apt install ansible -y
ansible --version
```

### **3️⃣ Set Up Ansible Inventory**

Create `ansible/inventory.ini`:

```ini
[web]
<EC2_PUBLIC_IP> ansible_user=ubuntu ansible_ssh_private_key_file=../ansible-key.pem
```

### **4️⃣ Create Ansible Playbook**

Create `ansible/playbook.yml`:

```yaml
- hosts: web
  become: yes
  tasks:
    - name: Install Docker & Docker Compose
      apt:
        name:
          - docker.io
          - docker-compose
        state: present
        update_cache: yes

    - name: Start Docker service
      service:
        name: docker
        state: started
        enabled: yes

    - name: Copy Docker Compose file
      template:
        src: roles/docker/templates/docker-compose.yml.j2
        dest: /home/ubuntu/docker-compose.yml

    - name: Deploy Microservices
      command: docker-compose -f /home/ubuntu/docker-compose.yml up -d
```

### **5️⃣ Define Ansible Role for Docker**

1. **Create Role Structure**

```sh
mkdir -p ansible/roles/docker/{tasks,templates,handlers}
```

2. **Define Tasks** (`ansible/roles/docker/tasks/main.yml`)

```yaml
- name: Install Docker
  apt:
    name: docker.io
    state: present

- name: Start Docker service
  service:
    name: docker
    state: started
    enabled: yes
```

3. **Create ****`docker-compose.yml`**** Template** (`ansible/roles/docker/templates/docker-compose.yml.j2`)

```yaml
version: '3.8'
services:
  service1-nodejs:
    build: ./microservices/service1-nodejs
    ports:
      - "3000:3000"
    networks:
      - app-network

  service2-python:
    build: ./microservices/service2-python
    ports:
      - "5000:5000"
    networks:
      - app-network

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - service1-nodejs
      - service2-python
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### **6️⃣ Create Microservices**

#### **Node.js Microservice**

`microservices/service1-nodejs/app.js`

```javascript
const express = require("express");
const app = express();
app.get("/", (req, res) => {
  res.send("Hello from Node.js Service!");
});
app.listen(3000, () => console.log("Service1 running on port 3000"));
```

#### **Python Microservice**

`microservices/service2-python/app.py`

```python
from flask import Flask
app = Flask(__name__)
@app.route("/")
def home():
    return "Hello from Python Service!"
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

### **7️⃣ Configure Nginx Reverse Proxy**

Create `nginx.conf`:

```nginx
events {}
http {
  server {
    listen 80;
    location /service1 {
      proxy_pass http://service1-nodejs:3000;
    }
    location /service2 {
      proxy_pass http://service2-python:5000;
    }
  }
}
```

### **8️⃣ Run Ansible Playbook**

1. Navigate to the Ansible directory:
   ```sh
   cd ansible
   ```
2. Run the Playbook:
   ```sh
   ansible-playbook -i inventory.ini playbook.yml
   ```

### **9️⃣ Verify Deployment**

1. **SSH into EC2 Instance**
   ```sh
   ssh -i ansible-key.pem ubuntu@<EC2_PUBLIC_IP>
   ```
2. **Check Running Containers**
   ```sh
   docker ps
   ```
3. **Test Services in the Browser**
   - `http://<EC2_PUBLIC_IP>/service1` → *"Hello from Node.js Service!"*
   - `http://<EC2_PUBLIC_IP>/service2` → *"Hello from Python Service!"*

### **🔄 Automate Deployment with Git**

1. Push to GitHub:
   ```sh
   git init
   git add .
   git commit -m "Initial Commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Pull updates on EC2:
   ```sh
   cd /home/ubuntu/microservices-ansible
   git pull origin main
   ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
   ```

---

## 🎯 Conclusion

🎉 **Successfully Deployed Microservices on AWS with Ansible!** 🚀

---

## 👤 Credits

This project was created and documented by **Rohan Karanje**. 🏆

If you found this helpful, consider starring the repository ⭐ and contributing! 🚀

to further improvements
