import { describe, expect, it } from "vitest"
import { LinkTo } from './LinkFactory'

describe("LinkFactory", () => {
  const linkTo = {
    home: LinkTo("/"),
    product: LinkTo("/product/:id"),
    localizedProduct: LinkTo("/:country/:locale/product/:id"),
  }

  it("handles parameter-less route home", () => {
    expect(linkTo.home()).toBe("/")
  })

  it("handles single-parameter route product", () => {
    expect(linkTo.product({ id: "1" })).toBe("/product/1")
  })

  it("handles multi-parameter route product", () => {
    expect(
      linkTo.localizedProduct({ country: "FR", locale: "fr", id: "1" }),
    ).toBe("/FR/fr/product/1")
  })

  describe('with weird paths', () => {
    const linkTo = {
      home: LinkTo("{/}?"),
      overview: LinkTo('/overview{/}?'),
      product: LinkTo("/product/:id{/*}?"),
    }
    it('navigates to home', () => {
      expect(linkTo.home()).toBe('')
    })
    it('navigates to overview', () => {
      expect(linkTo.overview()).toBe('/overview')
    })
    it('navigates to product 2', () => {
      expect(linkTo.product({ id: '2' })).toBe('/product/2')
    })
  })
})

