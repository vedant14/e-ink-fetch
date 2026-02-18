# Setup that powers my e-ink display

How it works
1. When triggered fetches checks the time
2. During work hours, fetches tasks from todoist
3. During off hours, fetches a quote from the data files
4. Converts them to bitmap image
5. Sends this image along with next refresh time to the e-ink display
6. The e-ink display runs a python script to fetch image and set it to display
7. The script then goes into sleep scheduled to wake up at the next refresh time.
