package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
)

var host = flag.String("host", "0.0.0.0", "http service host")
var port = flag.String("port", "80", "http service port")
var cert = flag.String("cert", "", "TLS certificate")
var key = flag.String("key", "", "TLS certificate private key")

func main() {
	flag.Parse()

	hub := NewHub()
	go hub.run()

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	})

	addr := fmt.Sprintf("%v:%v", *host, *port)

	log.Printf("Serving HTTP on %v", addr)

	err := http.ListenAndServeTLS(addr, *cert, *key, nil)
	if err != nil {
		log.Fatal(err)
	}
}
