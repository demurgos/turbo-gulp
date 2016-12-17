import * as express from "express";
import {posix as path} from "path";
import {root, serverUrl} from "./config";

export const router: any = express.Router();

/**
 * Angular Universal handler
 */
function ngApp(req: any, res: any) {
  res.render("index", {
    req,
    res,
    preboot: false,
    baseUrl: "/",
    requestUrl: req.originalUrl,
    originUrl: serverUrl
  });
}

// Serve static files
router.use(express.static(path.join(root, "static"), {index: false}));

// Routes with html5pushstate
// Ensure routes match client-side-app
router.get("/", ngApp);
router.get("/about", ngApp);
router.get("/about/*", ngApp);
router.get("/home", ngApp);
router.get("/home/*", ngApp);

// Server a custom 404 page in case of an unknown route
router.get("*", (req: any, res: any) => {
  res.setHeader("Content-Type", "application/json");
  const response = {status: 404, message: "Resource not found"};
  res.status(404).json(response);
});

export default router;
