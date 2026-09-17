# Matrix Chain Multiplication Optimization

A Java Spring Boot project that implements **Matrix Chain Multiplication using Interval Dynamic Programming**.

## What This Code Does

The application:

- Takes matrix dimensions as input.
- Calculates the minimum number of scalar multiplications.
- Finds the optimal parenthesization.
- Compares the optimized cost with the naive left-to-right multiplication cost.
- Calculates operations saved and efficiency.
- Displays the results through a web interface.
- Provides a 3D visualization of the matrix multiplication sequence.

## Algorithm

The core algorithm is **Interval Dynamic Programming**.

For matrices `A1...An`, the minimum multiplication cost is calculated using:

```text
dp[i][j] = min(
    dp[i][k] +
    dp[k+1][j] +
    p[i-1] * p[k] * p[j]
)
