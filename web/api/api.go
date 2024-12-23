package api

import (
	"net/http"

	"github.com/code-editor/web/websocket"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type api struct {
	server *echo.Echo
}

func (api *api) registerRoutes() {
	apiGroup := api.server.Group("/api")

	apiGroup.GET("/ws", func(c echo.Context) error {
		websocket.Handler(c.Response(), c.Request())
		return nil
	})

	apiGroup.GET("/health-check", func(c echo.Context) error {
		return c.JSON(http.StatusOK, echo.Map{
			"status": "OK",
		})
	})
}

func (api *api) Start() {
	api.registerRoutes()
	api.server.Logger.Fatal(api.server.Start(":8080"))
}

func New() *api {
	e := echo.New()

	e.Use(middleware.CORS())

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	return &api{
		server: e,
	}
}
