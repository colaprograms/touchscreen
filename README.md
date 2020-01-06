# touchscreen

This is a kiosk for the big touchscreen at the Technology Sandbox.

Run the kiosk as follows:

* Close all Chromium tabs

  If you don't do this, the webpage will open in your Chromium window instead
  of in kiosk mode.

* Run ./run.sh

  Killing this process will kill both the kiosk and its associated server

#### Installation note

This project requires Beautiful Soup 4 ***with soupsieve***.

If soupsieve is not installed, the parser will see all of the bibInfoLabel fields before the bibInfoData fields (in a single bibInfoEntry)
and it will not properly associate data with label.

Written by Hannah Cairns <hannah.abigail.cairns@gmail.com>
