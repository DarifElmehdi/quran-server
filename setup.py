from pyarabic.araby import strip_tashkeel
import json

f = open('meta.json')
data = json.load(f)
list = []
for item in data["data"]["surahs"]["references"]:
    newItem = item
    newItem["name"] = strip_tashkeel(item["name"])
    newItem["ar_revelationType"] = item["ar_revelationType"]
    list.append(newItem)
print(item)


with open('newData.json', 'w') as fp:
        json.dump(list, fp)
print("list dumped to data.json")