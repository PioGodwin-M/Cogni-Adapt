# Deployment Guide

## Environment Setup

This project requires a HuggingFace API key to function. 

### Get Your API Key
1. Visit https://huggingface.co/settings/tokens
2. Create a new access token (read permission is sufficient)
3. Copy the token

### Local Development
1. Create `.env.local` file in the project root
2. Add your API key:
   ```
   VITE_HUGGING_FACE_API_KEY=your_huggingface_api_key_here
   ```

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard
1. Push code to GitHub/GitLab/Bitbucket
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variable:
   - Key: `VITE_HUGGING_FACE_API_KEY`
   - Value: Your HuggingFace API key
5. Deploy

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add VITE_HUGGING_FACE_API_KEY

# Deploy to production
vercel --prod
```

## Important Notes

- The `vercel.json` file is already configured for Angular routing
- Environment variables must be prefixed with `VITE_` to be accessible in the browser
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- The API key will be exposed in the browser bundle - this is expected for client-side apps
- The app uses HuggingFace's Qwen2.5-72B-Instruct model for content transformation and chatbot features
- Consider implementing rate limiting and usage monitoring in production

## Troubleshooting

### API Key Not Working on Vercel
- Ensure the variable name is exactly `VITE_HUGGING_FACE_API_KEY` in Vercel dashboard
- **After adding environment variables, you MUST redeploy your project**
- Check that the API key is valid at https://huggingface.co/settings/tokens
- Verify the token has proper read permissions
- Check Vercel deployment logs for any initialization errors

### Build Errors on Vercel
- Verify all dependencies are in `package.json`
- Check that Node.js version is compatible (18.x or higher recommended)
- Review build logs in Vercel dashboard
- Ensure the build command is: `npm run build`

### Routing Issues
- The `vercel.json` rewrites configuration handles Angular routing
- All routes redirect to `index.html` for client-side routing

## Verification

After deployment, verify that:
1. The site loads without errors
2. You can navigate to different pages/routes
3. The chatbot and content transformation features work
4. No console errors related to missing API keys
