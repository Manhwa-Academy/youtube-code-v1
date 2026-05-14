import json
import os
from collections import OrderedDict

def deduplicate_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f, object_pairs_hook=OrderedDict)
    
    def deduplicate_recursive(obj):
        if isinstance(obj, dict):
            new_obj = OrderedDict()
            for k, v in obj.items():
                if k not in new_obj:
                    new_obj[k] = deduplicate_recursive(v)
            return new_obj
        elif isinstance(obj, list):
            return [deduplicate_recursive(i) for i in obj]
        else:
            return obj

    new_data = deduplicate_recursive(data)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)

messages_dir = r'c:\Users\vuliz\Music\youtube-code-v1\messages'
for filename in os.listdir(messages_dir):
    if filename.endswith('.json'):
        file_path = os.path.join(messages_dir, filename)
        print(f"Deduplicating {filename}...")
        deduplicate_json(file_path)
