#!/bin/bash

echo "🔐 Setting up secure AI Chat architecture with Supabase Edge Functions"
echo "================================================="

# Check for required dependencies
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or follow: https://supabase.com/docs/reference/cli/installing-the-cli"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Authenticated with Supabase"

# Prompt for OpenAI API key if not already set
echo ""
echo "🔑 Setting OpenAI API Key as Supabase secret..."

read -p "Enter your OpenAI API Key: " -s OPENAI_API_KEY
echo ""

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OpenAI API Key is required"
    exit 1
fi

# Set the secret in Supabase
echo "📡 Setting OPENAI_API_KEY as Supabase secret..."
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"

if [ $? -eq 0 ]; then
    echo "✅ OpenAI API Key set successfully"
else
    echo "❌ Failed to set OpenAI API Key"
    exit 1
fi

# Deploy the Edge Function
echo ""
echo "🚀 Deploying ai-chat Edge Function..."
supabase functions deploy ai-chat

if [ $? -eq 0 ]; then
    echo "✅ Edge Function deployed successfully"
else
    echo "❌ Failed to deploy Edge Function"
    exit 1
fi

# Final instructions
echo ""
echo "🎉 Setup complete!"
echo "================================================="
echo ""
echo "✅ Your secure AI Chat architecture is now deployed:"
echo "   • OpenAI API key securely stored in Supabase"
echo "   • ai-chat Edge Function deployed"
echo "   • React Native app now routes through secure backend"
echo ""
echo "⚠️  IMPORTANT: Remove any EXPO_PUBLIC_OPENAI_API_KEY from your .env files"
echo ""
echo "🔧 Your .env should only contain these public values:"
echo "   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url"
echo "   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
echo ""
echo "🧪 Test your setup:"
echo "   1. Run your React Native app"
echo "   2. Navigate to a chat conversation"
echo "   3. Send a message"
echo "   4. Verify you get an AI response"
echo ""
echo "📚 Architecture:"
echo "   React Native → Supabase Edge Function → OpenAI"
echo "   (API keys never exposed to client)"