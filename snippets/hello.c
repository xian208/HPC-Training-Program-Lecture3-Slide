#include <stdio.h>

#define MAX 5000
#define MIN 1000
#define AVG(a, b) ((a + b) / 2)

int main() {
    int a = MAX;
    int b = MIN;
    int c = AVG(a, b);
    printf("%d\n", c);
    return 0;
}
