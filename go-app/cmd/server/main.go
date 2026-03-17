package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

var version = "1.0.0"

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "Welcome to DevOps Course - This is Go app")
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	log.Printf("Server running on port 8080 (version %s)", version)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
