package api

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

type SuccesResponse struct {
	status int
	userId string
}

type ErrorResponse struct {
	status  int
	message string
}

type SuccesServerResponse struct {
	Status int    `json:"status"`
	UserId string `json:"userId"`
}

type ErrorServerResponse struct {
	Status  int    `json:"status"`
	Message string `json:"message"`
}

func handleError(err error, w http.ResponseWriter, message string) {
	w.WriteHeader(http.StatusInternalServerError)
	resVal := &ErrorResponse{
		status:  http.StatusInternalServerError,
		message: "Internal Server Error",
	}
	resStr, _ := json.Marshal(resVal)
	fmt.Printf(err.Error())
	fmt.Fprintf(w, string(resStr))
}

func Handler(w http.ResponseWriter, r *http.Request) {
	client := http.Client{}

	apiKey := os.Getenv("API_KEY")
	apiUrl := os.Getenv("API_URL")

	phoneNo := r.URL.Query().Get("phoneNo")

	url := fmt.Sprintf("https://%s/getUserId?phoneNo=%s", apiUrl, phoneNo)

	req, err := http.NewRequest(http.MethodGet, url, nil)

	if err != nil {
		handleError(err, w, "Internal Server Error")
		return
	}

	req.Header.Set("authorization", apiKey)

	res, err := client.Do(req)

	if err != nil {
		handleError(err, w, "Internal Server Error (res)")
		return
	}

	defer res.Body.Close()

	resData, err := ioutil.ReadAll(res.Body)

	if err != nil {
		handleError(err, w, "Internal Server Error (ReadAll)")
		return
	}

	var SuccesServerResponse SuccesServerResponse
	var ErrorServerResponse ErrorResponse

	if err := json.Unmarshal(resData, &SuccesServerResponse); err != nil {
		if err := json.Unmarshal(resData, &ErrorServerResponse); err != nil {
			handleError(err, w, "Internal Server Error (JSON Parsing)")
			return
		}
		if ErrorServerResponse.status == http.StatusNotFound {
			nfResVal := &ErrorResponse{
				status:  http.StatusNotFound,
				message: "User Not Found.",
			}
			nfRes, _ := json.Marshal(nfResVal)
			fmt.Fprintf(w, string(nfRes))
		}
	}

	fResVal := &SuccesResponse{
		status: http.StatusOK,
		userId: SuccesServerResponse.UserId,
	}
	fRes, err := json.Marshal(fResVal)
	fmt.Fprint(w, fRes)
}
