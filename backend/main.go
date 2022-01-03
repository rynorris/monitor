package main

import (
	"crypto/tls"
	"flag"
	"fmt"
	"log"
	"net/http"

	"golang.org/x/crypto/acme/autocert"
)

var host = flag.String("host", "0.0.0.0", "http service host")
var port = flag.String("port", "80", "http service port")

func main() {
	flag.Parse()

	hub := NewHub()
	go hub.run()

	certManager := autocert.Manager{
        Prompt:     autocert.AcceptTOS,
        HostPolicy: autocert.HostWhitelist("api.monitor.norris.dev"), // Your domain here
        Cache:      autocert.DirCache("certs"),            // Folder for storing certificates
    }

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ServeWs(hub, w, r)
	})

	addr := fmt.Sprintf("%v:%v", *host, *port)

	log.Printf("Serving HTTP on %v", addr)

	server := &http.Server{
        Addr: ":https",
        TLSConfig: &tls.Config{
            GetCertificate: certManager.GetCertificate,
        },
    }

    go http.ListenAndServe(":http", certManager.HTTPHandler(nil))

	err := server.ListenAndServeTLS("", "")
	if err != nil {
		log.Fatal(err)
	}
}
