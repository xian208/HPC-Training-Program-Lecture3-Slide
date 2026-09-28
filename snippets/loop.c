#include <stdio.h>
int main() {
    double s = 0;
    for (long i = 1; i <= 500000000; i++)
        s += 1.0 / ((double)i * i);
    printf("%.12f\n", s);
    return 0;
}
