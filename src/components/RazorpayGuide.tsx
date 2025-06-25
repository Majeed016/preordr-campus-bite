
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Key, Settings, Globe } from 'lucide-react';

const RazorpayGuide = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Razorpay Live Integration Guide</h1>
        <p className="text-gray-600">Step-by-step guide to integrate Razorpay live payments</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              <span>Create Razorpay Account & Get Live Keys</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Account Setup</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>1. Go to <a href="https://razorpay.com" className="underline" target="_blank">razorpay.com</a></li>
                <li>2. Sign up for a business account</li>
                <li>3. Complete KYC verification (required for live mode)</li>
                <li>4. Submit business documents</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Get Live API Keys</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>1. Go to Settings → API Keys</li>
                <li>2. Generate Live Keys (after account activation)</li>
                <li>3. Note down: Key ID and Key Secret</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              <span>Configure Supabase Environment Variables</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Add to Supabase Secrets</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>1. Go to your Supabase project → Settings → Edge Functions</li>
                <li>2. Add these secrets:</li>
                <li className="ml-4">• RAZORPAY_KEY_ID: your_live_key_id</li>
                <li className="ml-4">• RAZORPAY_KEY_SECRET: your_live_key_secret</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              <span>Create Payment Edge Function</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Create supabase/functions/create-payment/index.ts</h4>
              <pre className="text-xs text-purple-800 bg-purple-100 p-2 rounded overflow-x-auto">
{`import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { amount, currency = 'INR', receipt } = await req.json()
    
    const razorpayAuth = btoa(\`\${Deno.env.get('RAZORPAY_KEY_ID')}:\${Deno.env.get('RAZORPAY_KEY_SECRET')}\`)
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': \`Basic \${razorpayAuth}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency,
        receipt,
      }),
    })

    const order = await response.json()
    
    return new Response(
      JSON.stringify(order),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              <span>Update Frontend Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">Install Razorpay SDK</h4>
              <pre className="text-xs text-indigo-800 bg-indigo-100 p-2 rounded">
                npm install razorpay
              </pre>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-2">Update Environment Variables</h4>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Add VITE_RAZORPAY_KEY_ID to your .env file</li>
                <li>• Use your live Razorpay Key ID</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
              <span>Configure Webhooks</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Setup Webhook Endpoint</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>1. Go to Razorpay Dashboard → Webhooks</li>
                <li>2. Add webhook URL: https://your-project.supabase.co/functions/v1/payment-webhook</li>
                <li>3. Select events: payment.captured, payment.failed</li>
                <li>4. Generate webhook secret</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">6</span>
              <span>Test Live Integration</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Pre-Deployment Checklist</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>✓ Razorpay account activated</li>
                <li>✓ Live API keys configured</li>
                <li>✓ Webhook endpoint setup</li>
                <li>✓ SSL certificate on domain</li>
                <li>✓ Test transactions working</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-bold text-gray-900 mb-4">Important Notes:</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• Live mode requires completed KYC and business verification</li>
          <li>• Test thoroughly before going live</li>
          <li>• Keep your secret keys secure and never expose them in frontend code</li>
          <li>• Monitor transactions via Razorpay dashboard</li>
          <li>• Set up proper error handling and logging</li>
        </ul>
      </div>
    </div>
  );
};

export default RazorpayGuide;
