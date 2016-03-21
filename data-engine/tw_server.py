# This file provided by Facebook is for non-commercial testing and evaluation
# purposes only. Facebook reserves all rights not expressly granted.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
# ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import json
import sys
import requests
import csv
import Queue
import signal


from twisted.internet import reactor
from twisted.internet import threads
from twisted.python import log
from autobahn.twisted.websocket import WebSocketServerFactory
from autobahn.twisted.websocket import WebSocketServerProtocol

import spark_python.spark_python as sp
sp.bootstrap('/Users/fix/dev/spark-1.4.1-bin-hadoop2.6/')
import pyspark
from pyspark.context import SparkContext
from pyspark.sql import SQLContext
from pyspark.sql.types import *
sc = SparkContext(appName="PySparkShell")
sqlContext = SQLContext(sc)

peers = []


def signal_handler(signal, frame):
        print('You pressed Ctrl+C!')
        for peer in peers:
            peer.queue.put(None)
        reactor.stop()
        sc.stop()
        sys.exit(0)
signal.signal(signal.SIGINT, signal_handler)


def parsePayload(payload):
    parts = payload.split(' ')
    func = parts[0]
    parameters = parts[1:]
    return (func, parameters)


def makeJSON(id, type, output, varname=None):
    if (type == "json"):
        dfJSON = output.toJSON(use_unicode=True).collect()
        output = [eval(row) for row in dfJSON]
        return json.dumps({
            "id": str(id).encode('utf-8'),
            "type": str(type).encode('utf-8'),
            "varname": varname, "output": output})
    else:
        return json.dumps({
            "id": str(id).encode('utf-8'),
            "type": str(type).encode('utf-8'),
            "output": output})


class EchoServerProtocol(WebSocketServerProtocol):

    def onConnect(self, request):
        print("[tw_server] WebSocket connection request from: {}".format(
            self.peer))
        peers.append(self)
        print "[tw_server] Peers after new connection: %s" % peers
        self.env = {}
        self.queue = Queue.Queue()
        threads.deferToThread(self.process)

    def onClose(self, wasClean, code, reason):
        msg = "[tw_server] WebSocket connection for {} closed: {}"
        print(msg.format(self.peer, reason))
        peers.remove(self)
        print "[tw_server] Peers after closed connection: %s" % peers

    def process(self):
        while True:
            msg = self.queue.get()
            if msg is None:
                return
            payload = msg[0]
            isBinary = msg[1]
            print "[%s] processing payload: %s, isBinary: %s" % (
                self.peer, str(payload), str(isBinary))
            jpayload = json.loads(payload)
            id = jpayload['id']
            type = str(jpayload['type'])
            payload = str(jpayload['payload'])
            if type == 'code':
                (func, params) = parsePayload(payload)
                if func == '%getCSV':
                    result = self.getCSV(
                        id=id,
                        url=params[0],
                        filename=params[1])
                    self.printResult(result)
                elif func == '%loadCSV':
                    result = self.loadCSV(
                        id=id,
                        filename=params[0],
                        varname=params[1])
                    self.printResult(result)
                elif func == '%listTables':
                    result = self.listTables(id=id)
                    self.printResult(result)
                elif func == '%sql':
                    result = self.sqlQuery(
                        id=id,
                        varname=params[0],
                        query=' '.join(params[1:]))
                    self.printResult(result)
                elif func == '%describe':
                    result = self.describe(id=id, varname=params[0])
                    self.printResult(result)
                else:
                    self.sendMessage('Command unknown', isBinary)

    def onMessage(self, payload, isBinary):
        print "[%s] payload: %s, isBinary: %s" % (
            self.peer, str(payload), str(isBinary))
        self.queue.put((payload, isBinary))

    def printResult(self, result):
        print "[%s] Sending result=%s" % (self.peer, result)
        self.sendMessage(result, False)

    def getCSV(self, id, url, filename):
        msg = "[%s] [%s] Getting CSV file from url=%s and filename=%s"
        print msg % (self.peer, id, url, filename)
        r = requests.get(url)
        content_list = r.content.split("\r\n")
        reader = csv.reader(content_list)
        header = reader.next()
        header_cleaned = [field.replace(' ', '_') for field in header]
        csv_list = []
        for row in reader:
            if len(row) > 0:
                csv_list.append(row)
        csv_rdd = sc.parallelize(csv_list)
        fields = [
            StructField(field_name, StringType(), True)
            for field_name in header_cleaned]
        schema = StructType(fields)
        csv_df = sqlContext.createDataFrame(csv_rdd, schema)
        folderName = "./" + filename
        csv_df.write.save(folderName, format="parquet", mode="overwrite")
        ret = makeJSON(id=id, type="text", output=csv_rdd.count())
        return ret

    def loadCSV(self, id, filename, varname):
        msg = "[%s] [%s] Loading load CSV file from filename=%s into varname=%s"
        print msg % (self.peer, id, filename, varname)
        folderName = "./" + filename
        csv_df = sqlContext.read.load(folderName)
        # TODO:
        # sqlContext must be created with the protocol in order to keep tables
        # constrained to the specific context
        csv_df.registerTempTable(varname)
        self.env[varname] = csv_df
        count = csv_df.count()
        ret_string = "Loaded %s into %s: %s rows" % (filename, varname, count)
        ret = makeJSON(id=id, type="text", output=ret_string)
        return ret

    def listTables(self, id):
        print "[%s] [%s] List tables" % (self.peer, id)
        variables = self.env.keys()
        variables.sort()
        variables_str = ', '.join(variables)
        ret_string = "Tables: %s" % (variables_str)
        ret = makeJSON(id=id, type="text", output=ret_string)
        return ret

    def sqlQuery(self, id, varname, query):
        print "[%s] [%s] SQL query: [%s]" % (self.peer, id, query)
        df = sqlContext.sql(query)
        df.registerTempTable(varname)
        self.env[varname] = df
        ret = makeJSON(id=id, type="json", output=df, varname=varname)
        return ret

    def describe(self, id, varname):
        print "[%s] [%s] describe: [%s]" % (self.peer, id, varname)
        df = self.env[varname]
        fields = df.schema.fields
        output = '\n'.join([f.simpleString() for f in fields])
        ret = makeJSON(id=id, type="text", output=output)
        return ret


if __name__ == '__main__':
    log.startLogging(sys.stdout)

    factory = WebSocketServerFactory(u"ws://127.0.0.1:3001", debug=False)
    factory.protocol = EchoServerProtocol
    # factory.setProtocolOptions(maxConnections=2)

    reactor.listenTCP(3001, factory)
    reactor.run()
