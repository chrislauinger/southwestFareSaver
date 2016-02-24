import SocketServer
from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler
import sys, os
sys.path.append(os.path.abspath('../../../Projects/southwestPriceScraper/swa-scraper/'))
from runUserFares import runUserFares

runUserFares()

def some_function():
	runUserFares()
	print "some_function got called"

class MyHandler(BaseHTTPRequestHandler):
	def do_GET(self):
		some_function()
		self.send_response(200)

	def do_POST(self):
		some_function()
		self.send_response(200)
		self.send_header("Content-type", "")
		self.send_header("Access-Control-Allow-Origin", "*");
		self.send_header("Access-Control-Expose-Headers", "Access-Control-Allow-Origin");
		self.send_header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		self.end_headers()

httpd = HTTPServer(("", 8081), MyHandler)
httpd.serve_forever()


