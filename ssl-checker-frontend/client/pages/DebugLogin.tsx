import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

export default function DebugLogin() {
  const [email, setEmail] = useState('development@glasier.in');
  const [password, setPassword] = useState('Admin#1234');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testDirectCall = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('🔧 Testing direct API call...');
      console.log('🔧 Current hostname:', window.location.hostname);
      console.log('🔧 Current origin:', window.location.origin);
      
      // Test basic fetch first
      const fetchResponse = await fetch(`http://${window.location.hostname}:5002/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('✅ Fetch Response Status:', fetchResponse.status);
      const fetchData = await fetchResponse.json();
      console.log('✅ Fetch Data:', fetchData);
      
      // Now test with axios
      const axiosResponse = await api.post('/auth/login', { email, password });
      console.log('✅ Axios Response:', axiosResponse.data);
      
      setResult(`SUCCESS: ${JSON.stringify(axiosResponse.data, null, 2)}`);
      
    } catch (error: any) {
      console.error('❌ Test Error:', error);
      setResult(`ERROR: ${error.message}\nDetails: ${JSON.stringify(error.response?.data || error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testNetworkInfo = () => {
    const info = {
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      origin: window.location.origin,
      userAgent: navigator.userAgent,
      expectedApiUrl: `http://${window.location.hostname}:5002/api`
    };
    
    console.log('🔧 Network Info:', info);
    setResult(`NETWORK INFO:\n${JSON.stringify(info, null, 2)}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Debug Login Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={testDirectCall} disabled={loading}>
                {loading ? 'Testing...' : 'Test API Call'}
              </Button>
              <Button onClick={testNetworkInfo} variant="outline">
                Show Network Info
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-sm">
                {result}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
