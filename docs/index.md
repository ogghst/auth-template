---
layout: home
title: Auth Template Documentation
titleTemplate: Next.js and NestJS Authentication Template

hero:
  name: Auth Template
  text: Next.js and NestJS Authentication Template
  tagline: A secure, full-stack authentication template with GitHub OAuth
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/yourusername/your-repo-name

features:
  - icon: 🔐
    title: Secure Authentication
    details: Built-in GitHub OAuth integration with JWT token management and secure session handling
  - icon: ⚡️
    title: Modern Stack
    details: Next.js 14 frontend with App Router and NestJS 10 backend for optimal performance
  - icon: 🛠️
    title: Developer Experience
    details: TypeScript support, ESLint configuration, and Turborepo monorepo setup
  - icon: 📦
    title: Production Ready
    details: Includes deployment configurations, environment management, and security best practices

head:
  - - meta
    - name: description
      content: A secure full-stack authentication template using Next.js and NestJS
  - - meta
    - name: keywords
      content: nextjs, nestjs, authentication, oauth, github, typescript
---

<div class="vp-doc">

# Quick Navigation

<div class="quick-links">

## 📚 Documentation

- [Introduction](/guide/introduction)
- [Getting Started](/guide/getting-started)
- [API Reference](/api/)
- [Authentication Flow](/auth/flow)

## 🔧 Setup & Configuration

- [Environment Setup](/guide/getting-started#installation)
- [GitHub OAuth Setup](/guide/getting-started#github-oauth-setup)
- [Database Configuration](/guide/getting-started#database-setup)
- [Deployment Guide](/guide/getting-started#deployment)

## 🚀 Features

- Secure Authentication with GitHub OAuth
- JWT Token Management
- TypeScript Support
- Monorepo Structure
- API Documentation
- Automated Testing

## 💡 Resources

- [API Documentation](/api/)
- [Authentication Flow](/auth/flow)
- [Troubleshooting](/guide/getting-started#troubleshooting)
- [Contributing Guidelines](https://github.com/yourusername/your-repo-name/blob/main/CONTRIBUTING.md)

</div>

</div>

<style>
.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.quick-links h2 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.quick-links ul {
  list-style: none;
  padding: 0;
}

.quick-links li {
  margin: 8px 0;
}

.quick-links a {
  color: var(--vp-c-brand);
  text-decoration: none;
}

.quick-links a:hover {
  text-decoration: underline;
}
</style>
