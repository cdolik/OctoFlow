describe('GlobalErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should display error UI when an error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <GlobalErrorBoundary>
        <ThrowError />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should recover after clicking retry', () => {
    let shouldThrow = true;
    const MaybeThrow = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Recovered</div>;
    };

    render(
      <GlobalErrorBoundary>
        <MaybeThrow />
      </GlobalErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    shouldThrow = false;
    userEvent.click(screen.getByRole('button', { name: /retry/i }));
    
    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });
});