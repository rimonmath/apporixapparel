<script setup>
import {
  LogoFacebook,
  LogoInstagram,
  LogoLinkedin,
  LogoTwitter,
  Location,
  Mail,
  Call
} from '@vicons/ionicons5';
import { NIcon } from 'naive-ui';
import SmartLink from '../others/SmartLink.vue';
</script>

<template>
  <footer class="khudro-footer">
    <div class="footer-container">
      <!-- Column 1: About -->
      <div class="footer-col">
        <div class="flex items-center gap-2">
          <img src="/img/logo.png" class="inline-block h-[40px]"></img>
          <span class=" text-lg footer-logo">
            KhudroShop
          </span>
        </div>
        <p class="footer-desc mt-2">
          Empowering small businesses with simple, powerful tools to manage their online presence.
        </p>
        <p class="copyright">
          &copy; {{ new Date().getFullYear() }} Khudroshop. All rights reserved.
        </p>
      </div>

      <!-- Column 2: Quick Links -->
      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><SmartLink to="/privacy">Privacy Policy</SmartLink></li>
          <li><SmartLink to="/terms">Terms of Service</SmartLink></li>
          <li><SmartLink to="/about">About Us</SmartLink></li>
          <li><SmartLink to="/contact">Contact Support</SmartLink></li>
        </ul>
      </div>

      <!-- Column 3: Office Address -->
      <div class="footer-col">
        <h4>Office Address</h4>
        <div class="contact-item">
          <n-icon size="18" :component="Location" />
          <span>Moddhopara, Charnabin, Chhaikola, Chatmohar<br />Pabna-6630</span>
        </div>
        <div class="contact-item">
          <n-icon size="18" :component="Mail" />
          <span>khudroshop@gmail.com</span>
        </div>
        <div class="contact-item">
          <n-icon size="18" :component="Call" />
          <span>+8801841702957</span>
        </div>
      </div>

      <!-- Column 4: Follow Us -->
      <div class="footer-col">
        <h4>Follow Us</h4>
        <div class="social-links">
          <a href="#" target="_blank" aria-label="Facebook">
            <n-icon size="24" :component="LogoFacebook" />
          </a>
          <a href="#" target="_blank" aria-label="Twitter">
            <n-icon size="24" :component="LogoTwitter" />
          </a>
          <a href="#" target="_blank" aria-label="Instagram">
            <n-icon size="24" :component="LogoInstagram" />
          </a>
          <a href="#" target="_blank" aria-label="LinkedIn">
            <n-icon size="24" :component="LogoLinkedin" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.khudro-footer {
  background-color: #353535;
  color: #e0e0e0;
  padding: 60px 20px;
  font-family: 'Inter', sans-serif;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
}

.footer-col h3.footer-logo {
  color: #007c3e; /* Brand color */
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.footer-col h4 {
  color: #fff;
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
}

.footer-desc {
  line-height: 1.6;
  margin-bottom: 20px;
  color: #ccc;
}

.copyright {
  font-size: 14px;
  color: #888;
}

.footer-col ul {
  list-style: none;
  padding: 0;
}

.footer-col ul li {
  margin-bottom: 12px;
}

.footer-col ul li a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-col ul li a:hover {
  color: var(--primary-500);
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 15px;
  color: #ccc;
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-links a {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.social-links a:hover {
  background-color: #007c3e;
  transform: translateY(-3px);
}

@media (max-width: 768px) {
  .khudro-footer {
    padding: 40px 20px;
  }

  .footer-container {
    gap: 30px;
  }
}
</style>
