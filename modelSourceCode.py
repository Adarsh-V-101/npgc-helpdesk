import requests

try:
    # myapi = "https://official-joke-api.appspot.com/random_joke"
    # myapi = "https://api.restful-api.dev/objects/6"
    # res = requests.delete(myapi)
    myapi = "https://api.restful-api.dev/objects"
    postdata = {
        'id':'14',
            "name": "Apple MacBook Pro 16",
            "data": {
                "year": 2019,
                "price": 1849.99,
                "CPU model": "Intel Core i9",
                "Hard disk size": "1 TB",
            },
        }
    res = requests.post(myapi,json = postdata)
    # res = requests.get(myapi)
    if res.status_code == 200:
        print("success", res.status_code)
        data = res.json()
        print(data)
    else:
        print("got error", res.status_code, res.json())
except:
    print("Got some error please retry")
