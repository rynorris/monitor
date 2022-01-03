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
var port = flag.String("port", "443", "http service port")
var cert = flag.String("cert", "", "tls certificate file")
var key = flag.String("key", "", "tls key file")

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

	log.Printf("Serving HTTPS on %v", addr)

	if len(*cert) > 0 && len(*key) > 0 {
		log.Printf("Using static certificate")
		err := http.ListenAndServeTLS(addr, *cert, *key, nil)
		if err != nil {
			log.Fatal(err)
		}
		return
	}

	log.Printf("Using autocert")

	certManager := autocert.Manager{
		Prompt:     autocert.AcceptTOS,
		HostPolicy: autocert.HostWhitelist("api.monitor.norris.dev"), // Your domain here
		Cache:      autocert.DirCache("certs"),                       // Folder for storing certificates
	}

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
