import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, ArrowRight, Shield, Zap } from 'lucide-react';

export default function ConnectMetaAccountPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Database className="h-16 w-16 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Connect Your Meta Ad Account</CardTitle>
          <CardDescription className="text-base mt-2">
            Securely connect to Meta's Marketing API to analyze your ad performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
              <Shield className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold">Secure</h3>
              <p className="text-sm text-gray-600 mt-1">
                Tokens encrypted at rest
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
              <Zap className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold">Fast</h3>
              <p className="text-sm text-gray-600 mt-1">
                Direct API access
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
              <Database className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold">Complete</h3>
              <p className="text-sm text-gray-600 mt-1">
                All metrics available
              </p>
            </div>
          </div>

          {/* What we access */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold mb-2">What we'll access:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center">
                <ArrowRight className="mr-2 h-4 w-4 text-blue-600" />
                Ad account insights (reach, impressions, spend)
              </li>
              <li className="flex items-center">
                <ArrowRight className="mr-2 h-4 w-4 text-blue-600" />
                Campaign and ad data
              </li>
              <li className="flex items-center">
                <ArrowRight className="mr-2 h-4 w-4 text-blue-600" />
                Demographic breakdowns
              </li>
              <li className="flex items-center">
                <ArrowRight className="mr-2 h-4 w-4 text-blue-600" />
                Conversion and revenue data
              </li>
            </ul>
          </div>

          {/* Connect Button */}
          <div className="pt-4">
            <a href="/api/meta/oauth">
              <Button className="w-full" size="lg">
                <Database className="mr-2 h-5 w-5" />
                Connect with Meta
              </Button>
            </a>
            <p className="mt-4 text-center text-sm text-gray-600">
              You'll be redirected to Meta to authorize access
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

