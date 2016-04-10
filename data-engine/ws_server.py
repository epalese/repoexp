import sys
import os
import json
import Queue
import signal
import contextlib
import StringIO

from twisted.internet import reactor
from twisted.python import log
from autobahn.twisted.websocket import WebSocketServerFactory
from autobahn.twisted.websocket import WebSocketServerProtocol

from threading import Thread
from time import sleep

import spark_python.spark_python as sp
cur_dir = os.path.dirname(os.path.realpath(__file__))
sp.bootstrap(cur_dir + '/spark-1.6.1')
import pyspark
from pyspark.context import SparkContext
from pyspark.sql import SQLContext
sc = SparkContext(appName="PySparkShell")
sqlContext = SQLContext(sc)

peers = []


def signal_handler(signal, frame):
        print('You pressed Ctrl+C!')
        for peer in peers:
            peer.queue.put(None)
        sc.stop()
        reactor.stop()
        # sys.exit(0)
signal.signal(signal.SIGINT, signal_handler)


@contextlib.contextmanager
def stdoutIO(stdout=None):
    old = sys.stdout
    if stdout is None:
        stdout = StringIO.StringIO()
    sys.stdout = stdout
    yield stdout
    sys.stdout = old


code = r"""
import requests
import csv
from pyspark.sql.types import *


def getCSV(url, filename):
    msg = "Getting CSV file from url=%s and filename=%s"
    print msg % (url, filename)
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
    folderName = "./data/" + filename
    csv_df.write.save(folderName, format="parquet", mode="overwrite")
    count = csv_df.count()
    return count

"""


class DataEngineServerProtocol(WebSocketServerProtocol):

    def __init__(self):
        super(DataEngineServerProtocol, self).__init__()
        self.namespace = {}
        self.queue = Queue.Queue(maxsize=0)
        self.executor = Thread(target=self.infinite_processing)
        self.setupNamespace()

    def setupNamespace(self):
        exec(code, self.namespace)
        self.namespace['sc'] = sc
        self.namespace['sqlContext'] = sqlContext
        self.namespace['sneakyMessage'] = self.sneakyMessage

    def onConnect(self, request):
        print("[tw_server] WebSocket connection request from: {}".format(
            self.peer))
        peers.append(self)
        print "[tw_server] Peers after new connection: %s" % peers
        self.executor.start()
        # reactor.callInThread(self.infinite_processing)

    def onClose(self, wasClean, code, reason):
        log = "[tw_server] WebSocket connection for {} closed: {}"
        print(log.format(self.peer, reason))
        peers.remove(self)
        print "[tw_server] Peers after closed connection: %s" % peers

    def onMessage(self, message, isBinary):
        print "[%s] message: %s, isBinary: %s" % (
            self.peer, str(message), str(isBinary))
        jmessage = json.loads(message)
        self.queue.put((jmessage, isBinary))
        print "[%s] onMessage> queue : %s" % (self.peer, self.queue.queue)

    def sneakyMessage(self, message):
        output = json.dumps({
            "type": str("sneakyMessage").encode('utf-8'),
            "output": message.encode('utf-8')
        })
        reactor.callFromThread(self.sendMessage, output, False)

    def infinite_processing(self):
        print "[%s] starting infinite processing..." % (self.peer)
        while True:
            request = self.queue.get()
            if request is None:
                return
            response = self.process(request)
            reactor.callFromThread(self.sendMessage, response[0], response[1])
            self.queue.task_done()
            print "[%s] inifinite_processing: processed" % (self.peer)

    def process(self, request):
        message = request[0]
        print "[%s] process> Processing message: %s" % (self.peer, message)
        # sleep_time = randint(1, 5)

        with stdoutIO() as s:
            exec(message["payload"]["content"], self.namespace)
        id = message["payload"]["id"]
        output = json.dumps({
            "id": str(id).encode('utf-8'),
            "type": str("code").encode('utf-8'),
            "varname": str(self.peer).encode('utf-8'),
            "output": s.getvalue().encode('utf-8')
        })
        print "[%s] process> processing %s finished" % (self.peer, id)
        return (output, False)

if __name__ == '__main__':
    log.startLogging(sys.stdout)

    factory = WebSocketServerFactory(u"ws://127.0.0.1:3001", debug=False)
    factory.protocol = DataEngineServerProtocol
    # factory.setProtocolOptions(maxConnections=2)

    reactor.listenTCP(3001, factory)
    reactor.run()
