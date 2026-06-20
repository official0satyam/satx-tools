# SatX Tools

Welcome to **SatX Tools** ("Smart Tools For Everyday Problems"). 

This is a fast, SEO-optimized, mobile-first static website that hosts helpful everyday utility tools and calculators. The entire website is pre-rendered into static HTML files, making it load instantly, require zero database servers, and cost nothing to host.

---

## 📂 Folder Structure

Here is how the project folders are organized:

- `src/` - The source folder containing all raw contents.
  - `registry.json` - **The master registry file.** Every tool and page metadata (title, category, slug, etc.) is configured here.
  - `assets/` - Global styling (`css/`) and client-side logic scripts (`js/`).
  - `templates/` - Shared layouts (`header.html`, `footer.html`, etc.) so we don't copy-paste them on every page.
  - `pages/` - Core static pages like the Homepage, About, and Privacy pages.
  - `blog/` - Helpful articles to bring organic search traffic from Google.
  - `tools/` - Sub-folders for each individual tool (containing HTML layout, JavaScript logic, and unique SEO text).
- `dist/` - **The compiled website folder.** Created automatically when you run the build command. This is the folder deployed to the web.
- `build.js` - The compiler script that takes items from `src/`, combines them with templates, and builds the final static site inside `dist/`.
- `ROADMAP.md` - Document tracking growth milestones for the website.

---

## 🛠️ How to Run and Build Locally

You need [Node.js](https://nodejs.org/) installed on your computer.

### 1. Start Development Server
To build the site and launch a local web server to view it in your browser:
```bash
npm run dev
```
Once run, open your browser to `http://localhost:3000`. Any changes you make will be visible when you re-run the script or refresh.

### 2. Compile Static Output
To compile all files into the `dist/` folder without running a server:
```bash
npm run build
```

---

## ☁️ How to Deploy (Cloudflare Pages)

Deploying to Cloudflare Pages is completely free and takes 2 minutes:

1. Log in to your Cloudflare Dashboard.
2. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your GitHub repository for `satx-tools`.
4. Configure the Build settings:
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**. Cloudflare will automatically build and publish your site every time you push code to GitHub!

---

## ➕ How to Add a New Tool in 3 Steps

Adding a tool is designed to be extremely easy:

1. **Create the Tool Folder**:
   Create a folder in `src/tools/` (e.g., `src/tools/my-new-tool/`) containing:
   - `index.html` (the HTML layout/inputs for the tool).
   - `script.js` (the calculation logic).
   - `data.json` (the written content: title, description, instructions, examples, FAQs).

2. **Register the Tool**:
   Open `src/registry.json` and add your new tool under the `"tools"` list. For example:
   ```json
   {
     "name": "My New Tool",
     "slug": "my-new-tool",
     "category": "calculator",
     "popular": false
   }
   ```

3. **Run the Build**:
   Run `npm run build` and your new tool will be compiled automatically and linked on the Homepage, Category pages, Sitemap, and Search index!
