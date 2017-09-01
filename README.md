# OS Image Filter

Chrome extension to filter human skin in websites' images.


The extension filters images by analyzing their pixels, those within the human skin range are replaced by a grayscale tone.

The extension analyzes every IMG node in a webpage. It obtains the data of the image (pixel information)
displayed in the node by using a canvas element. Then, it checks every pixel and compares its components (RGB values)
against a range of values that define the human skin color. Those pixels within that range are grayed out.

In some cases, it is not possible to get the data of the image using a canvas element due to same origin policy; 
that happens when the images are fetched from domains different to the web page's. In those cases the
extension makes xml http requests to get the data of the image. 

To avoid CORS errors when fetching data using a xml http requests, the header of the response is modified so the data can be used with no problems.

Once an image has been filtered, it is encoded in base64 format, so this value can be 
set in the SRC attribute of a IMG node.

The extension allows to see the original image by clicking in the eye icon shown when the mouse pointers hovers
an IMG element.

<img src="filtered_website.jpg" height="500"/>

<!-- <div>
	<div style="text-align: center">
		Please support further development of this extension. 100% of your donation will be used for development.
	</div>
	<br/>
	<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" style="margin: 0 auto; width: 0>
		<input type="hidden" name="cmd" value="_s-xclick">
		<input type="hidden" name="hosted_button_id" value="KE9PLAN32JWS2">
		<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
		<img alt="" border="0" src=
		"https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
	</form>
</div> -->