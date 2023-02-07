import sys

def main():
    argument = sys.argv[1]
    if argument=="downloads":
        result = get_downloads()
    print(result)
    
def get_downloads():
    return "2"

if __name__ == '__main__':
    main()
