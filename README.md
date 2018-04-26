# Retro Hue
Controll your Philips Hue with your computer's microphone and create schemes based on the music's melody

<img src="https://raw.githubusercontent.com/msroot/retrohue/master/src/images/demo.png" align="center" height="540" width="880" style="text-align:center">

## Authentication:
First time you visit the page you have to press the Philips Bridge's button to authenticate the app, then  we cache the `username` in local storage.
After refreshing the page you have to select the lambs you want to use. If the selected lamp is off, we will turn it on for you!
Use the sensitivity slider to adjust the color changes. All sliders values saved in local storage so next time you refresh the window will remain the same.

## Reset: 
if u want to reset the `username` just  type `localStorage.removeItem('username'); in Google Chrome console`  

## Settings:
`Brightness:` Selected lamps Brightness

`Saturation: `Selected lamps Saturation

`Sensitivity: `How sensitive is hue to color change

`Transition Time: `The transition time between changes

## Issues:
All requests  made directly to your local network's Philips Bridge using a `http` via ajax. 
We use `getUserMedia()` to analyse the microphone's input so based the selected sensitivity  we make requests to Philips Bridge. 
The issue here is that local requests made with `http` and  `getUserMedia()` requires `https`
(see: https://goo.gl/Y0ZkNV) so it can'n run on GitHub Pages or Heroku as a service. 
Still you can see a demo here https://retrohue.herokuapp.com/  without controlling your lights

## Html: 
Clone repo and open the `index.html` file :)

## Rack:
`rackup` in root directory of the project  and visit `http://localhost:9292`

## Google Chrome: 
To use it as a extension: open in Chrome `about:extensions`  and enable Developer Mode, after LOAD UNPACKED and select the extension directory

## Compatibility 
Tested with Google Chrome (Version 66.0.3359.117 (Official Build) (64-bit))

## Credits:
Implementation:  [@yannis_kolovos](http://twitter.com/yannis_kolovos)
Logo: BashaChris [@BashaChris](http://twitter.com/BashaChris)
