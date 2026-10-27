import { test } from "node:test";
import assert from "node:assert/strict";
import { templateFile } from "./templates-store";
import { leadTemplates } from "../data/site";

test("every free template renders a branded file", () => {
  assert.ok(leadTemplates.length >= 4 && leadTemplates.length <= 6);
  for (const template of leadTemplates) {
    const file = templateFile(template.id);
    assert.ok(file, template.id);
    assert.equal(file!.filename, template.filename);
    assert.match(file!.body, /The Beacon Studio/);
    assert.match(file!.contentType, template.format === "csv" ? /text\/csv/ : /text\/markdown/);
  }
  assert.equal(templateFile("missing"), null);
});
