package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
)

var host = flag.String("host", "0.0.0.0", "http service host")
var port = flag.String("port", "80", "http service port")

func main() {
	flag.Parse()

	hub := NewHub()
	go hub.run()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	})

	addr := fmt.Sprintf("%v:%v", *host, *port)

	log.Printf("Serving HTTP on %v", addr)

	err := http.ListenAndServe(addr, nil)
	if err != nil {
		log.Fatal(err)
	}
}
