<div align="center">

<img src="{{path:'/mnt/data/73c9ab3a-0c41-45b4-a4da-ef94e25d30f8.png'}}" width="180" />

# **Webtir**
### *Create your own visual editor in minutes.*

A fully open-source, MIT-licensed drag-and-drop editor that you can embed in your own app.  
Powered by clean React components, a Webflow-style class system, AI integrations,  
and an embeddable SDK designed for teams who want total control.

[📘 Documentation](#) • [🚀 Demo](#) • [💬 Discord](#) • [📦 NPM](#)

---

</div>

## Table of Contents
- [What is Webtir?](#what-is-webtir)
- [Why Webtir Exists](#why-webtir-exists)
- [Key Capabilities](#key-capabilities)
- [Feature Overview](#feature-overview)
  - [The 4 Major Feature Blocks](#the-4-major-feature-blocks)
  - [The 9-Tile Feature Grid](#the-9tile-feature-grid)
- [Architecture](#architecture)
  - [Class System](#class-system)
  - [Component Drawer](#component-drawer)
  - [Data Binding & Actions](#data-binding)
  - [AI Integration Layer](#ai-integration-layer)
- [Embedding Webtir](#embedding-webtir)
- [Installation](#installation)
- [White-Label & Support](#whitelabel--support)
- [License](#license) --> $999/yr for an MIT-extended white-label friendly embeddable-use license is available

---

# What is Webtir?

**Webtir is an open-source visual editor you can drop into your product.**  
It’s the missing “builder layer” for modern SaaS:

- Drag-and-drop UI components  
- Real CSS class system  
- Responsive styling  
- Data binding  
- Real-time collaboration  
- Optional AI generation (bring your own model)  
- Completely embeddable inside your own platform

Webtir is MIT-licensed, self-hostable, white-label friendly, and works with  
platforms like **Lovable**, **v0**, **Cursor**, DIY React apps, and enterprise stacks.

---

# Why Webtir Exists

Every product team eventually realizes they need:
- a page builder  
- a template editor  
- a dashboard customizer  
- an internal tool designer  
- a visual component composer  

But building a drag-and-drop editor from scratch takes **18+ months** and becomes  
a never-ending maintenance burden.

**Webtir gives teams a powerful, customizable editor without the lock-in.**

You bring your components, your data, your AI models…  
and Webtir becomes the editor layer that sits on top.

---

# Key Capabilities

- 🔧 **Use your own React components**  
- 🎨 **Class-based styling like Webflow**  
- 📱 **Responsive breakpoints**  
- 🔌 **Data integration with Supabase, REST, GraphQL**  
- 💬 **Plug in your own AI (OpenAI, Gemini, local, custom endpoints)**  
- 🧩 **Preview + code mode**  
- 🧵 **Real-time collaboration**  
- 🔒 **MIT license: fork it, self-host it, white-label it**


### **1. Build with your own components**  
Webtir loads from your component drawer so users drag the same primitives that power your real app.  
Buttons, cards, lists, sections — map props once and let teams assemble interfaces safely.

---

### **2. Class-first styling, familiar to Webflow users**  
Margin, padding, flexbox, grids, backgrounds, filters, borders, shadows —  
all through a reusable CSS **class system**, not inline chaos.  
Perfect for teams who demand consistent design.

---

### **3. Connect to your existing data stack**  
Bind to Supabase, Postgres, REST, GraphQL, Airtable, Stripe, or internal APIs.  
Every component can receive real data, actions, and state — without reinventing your backend.

---

### **4. Bring your own AI**  
Webtir exposes a visual + code-based AI layer where you plug in  
OpenAI, Gemini, local models, or internal endpoints.  
Generate layouts, rewrite sections, or modify styles by prompt.

---

#### **🔲 Visual editor you can embed anywhere**  
Drop Webtir into any app with a small SDK and full sandboxing.

#### **🛡 MIT-licensed & white-label ready**  
Self-host, rebrand, fork, modify — no lock-in. Optional commercial support.

#### **🧩 Schema-driven configuration**  
Give Webtir a JSON schema and it automatically knows  
how to render controls for your components and props.

#### **🎨 Class & token-based styling**  
Reusable classes with breakpoints, tokens, variables, pseudo states, and effects.

#### **📦 Component drawer & prop controls**  
Searchable drawer mapped to your React component library with auto-generated forms.

#### **🗄 Data bindings & actions**  
Bind props to queries, variables, API calls, or server functions.

#### **✨ AI-assisted layouts & refactors**  
Ask AI to generate sections, adjust spacing, or rebuild blocks.

#### **</> Code-first escape hatch**  
View diffs, commit changes, or export templates as real code.

#### **🌐 Friendly with Lovable, v0, Cursor & others**  
Webtir plays nicely with all modern AI tools and lets you bring your own stack.

---

# Architecture

## Class System
A Webflow-inspired style engine with:
- Class rules  
- Pseudo states  
- Responsive layers  
- Tokens  
- Space / Layout / Size / Effects  
- Deterministic CSS generator  

## Component Drawer  
Auto-scans your component library via schema or TypeScript definitions.

## Data Binding  
Plugs into your APIs, DBs, and environments.

## AI Integration Layer  
Provide your own API keys and models — Webtir is model agnostic.

---

# Embedding Webtir

```tsx
import { WebtirEditor } from "@webtir/sdk";

<WebtirEditor
  components={myComponentLibrary}
  dataSources={myDataSources}
  aiProvider={myAIConfig}
/>

