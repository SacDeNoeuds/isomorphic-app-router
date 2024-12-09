import { describe, expect, it } from "vitest"
import { getLinkTo } from "./LinkFactory"

describe("LinkFactory", () => {
  it("handles parameter-less route home", () => {
    expect(getLinkTo("/")).toBe("/")
  })

  it("handles single-parameter route product", () => {
    expect(getLinkTo("/product/:id", { id: "1" })).toBe("/product/1")
  })

  it("handles multi-parameter route product", () => {
    const pathname = getLinkTo("/:country/:locale/product/:id", {
      // @ts-ignore
      toto: undefined,
      country: "FR",
      locale: "fr",
      id: "1",
    })
    expect(pathname).toBe("/FR/fr/product/1")
  })

  describe("with weird paths", () => {
    it("navigates to home", () => {
      expect(getLinkTo("{/}?")).toBe("")
    })
    it("navigates to overview", () => {
      expect(getLinkTo("/overview{/}?")).toBe("/overview")
    })
    it("navigates to product 2", () => {
      expect(getLinkTo("/product/:id{/*}?", { id: "2" })).toBe("/product/2")
    })
  })
})
