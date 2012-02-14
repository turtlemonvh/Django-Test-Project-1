from random import randint

def getpi(n):
    r = 1.0
    ct = 0.0
    for i in range(1,n):
        x = randint(0,10000)/10000.0
        y = randint(0,10000)/10000.0
        if (x**2 + y**2) < 1:
            ct += 1

    p = ct/n
    return p*(2*r)**2