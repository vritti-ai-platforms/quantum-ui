import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ThemeToggle,
  Toaster,
  Typography,
  toast,
} from '../lib/components';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center gap-4 border-b px-6">
        <Typography variant="h5" className="font-semibold">
          Quantum UI - Toast Testing
        </Typography>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <Toaster position="top-center" />

      <main className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <Typography variant="h2" className="mb-4">
              Toast Styling Test
            </Typography>
            <Typography variant="body1" intent="secondary" className="mb-4">
              Click each button to see the toast with its corresponding color border.
            </Typography>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Toast Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => toast.success('Operation completed successfully!')}>
                  Success (green)
                </Button>
                <Button variant="outline" onClick={() => toast.error('Something went wrong!')}>
                  Error (red)
                </Button>
                <Button variant="outline" onClick={() => toast.warning('Please review before continuing')}>
                  Warning (amber)
                </Button>
                <Button variant="outline" onClick={() => toast.info('Here is some helpful information')}>
                  Info (cyan)
                </Button>
                <Button variant="outline" onClick={() => toast.loading('Processing your request...')}>
                  Loading (primary)
                </Button>
                <Button variant="outline" onClick={() => toast('This is a default message')}>
                  Default (no border)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loading → Success/Error Transitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    const id = toast.loading('Processing...');
                    setTimeout(() => {
                      toast.success('Done!', { id });
                    }, 2000);
                  }}
                >
                  Loading → Success (2s)
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const id = toast.loading('Processing...');
                    setTimeout(() => {
                      toast.error('Failed!', { id });
                    }, 2000);
                  }}
                >
                  Loading → Error (2s)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toasts with Descriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.success('File uploaded', {
                      description: 'Your file has been uploaded successfully.',
                    })
                  }
                >
                  Success with description
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.error('Upload failed', {
                      description: 'Please check your file size and try again.',
                    })
                  }
                >
                  Error with description
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default App;
