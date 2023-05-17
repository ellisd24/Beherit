import { store } from '../../../../store'
import { CompendiumItem, Frame, ItemType, Manufacturer } from '../../../../class'
import { ICompendiumItemData, ITagCompendiumData } from '../../../../interface'

interface ILicenseRequirement {
  source: string
  name: string
  license_id: string
  rank: number
  items: string[]
  missing?: boolean
}

interface ILicensedItemData extends ICompendiumItemData {
  source: string
  license: string
  license_level: number
  license_id?: string
}

abstract class LicensedItem extends CompendiumItem {
  public readonly Source: string
  public readonly LicenseLevel: number
  private _license: string
  private _license_id: string

  public constructor(data: ILicensedItemData, packTags?: ITagCompendiumData[], packName?: string) {
    super(data, packTags, packName)
    this.Source = data.source ? data.source.toUpperCase() : ''
    this._license = data.license || ''
    this._license_id = data.license_id || ''
    // Temporary fix for data missing license_ids
    if (!this._license_id && this._license && this._license !== 'GMS') {
      this._license_id = this._license.toUpperCase()
      console.log(this._license, this._license_id)
    }
    this.LicenseLevel = parseInt(data.license_level as any) || 0
  }

  public get Manufacturer(): Manufacturer {
    return store.getters.referenceByID('Manufacturers', this.Source)
  }

  public get License(): string {
    return this.ItemType === ItemType.Frame ? this.Name : this._license
  }

  public get LicenseString(): string {
    if (this._license) return `${this._license} ${this.LicenseLevel}`
    return this.Source
  }

  public get LicenseID(): string {
    return this._license_id
  }

  public get RequiredLicense(): ILicenseRequirement {
    return {
      source: this.Source,
      name: this.getLicenseName(),
      license_id: this.LicenseID,
      rank: this.LicenseLevel,
      items: [this.ItemType === ItemType.Frame ? `${this.Name} Frame` : this.Name],
    }
  }

  private getLicenseName(): string {
    if (this.ItemType === ItemType.Frame) {
      const f = this as unknown as Frame
      if (f.IsVariantFrame) return f.Variant
      return this.License
    }
    return this.License
  }
}

export { LicensedItem, ILicensedItemData }
