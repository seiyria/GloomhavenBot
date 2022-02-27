# -*- coding: utf-8 -*-
"""
Created on Sun Feb 27 10:19:21 2022

@author: Joseph
"""

import os
from PIL import Image


sep: str = os.path.sep
class_root: str = "images" + os.path.sep + "characters"
# Smallest found size of cards: several different standards...
expected_size = (409, 569)

"""
    Optionally pass an argument for the root directory to work in, otherwise
    assumes that the current working directory is the target.
"""
#root_dir: str = sys.argv[1] or os.getcwd()
root_dir: str = os.getcwd()

print(f"Reducing all images in directory {root_dir}")
    
for root, dirs, files in os.walk(root_dir):
    if class_root in root and not dirs:
        # We are in the directory of a class
        path = str(root) + os.path.sep
        images = [path + file for file in files if ".jpg" in file]
        # We have all the card images
        for image in images:
            try:
                with Image.open(image) as im:
                    print(f"Resizing {image}")
                    reduced_image = im.resize(expected_size)
                    reduced_image.save(image)
            except OSError as e:
                print(e)
                pass
