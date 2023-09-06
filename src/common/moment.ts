interface DateAttrs {
  year: number; // 年
  month: number; // 月
  date: number; // 日
  hour: number; // 时
  minute: number; // 分
  second: number; // 秒
  day: number; // 星期
  monthDays: number; // 本月的天数
  stamp: number; // 时间戳
}

function numberStringify(number: number): string {
  return number < 10 ? `0${number}` : number.toString()
}

export function stamp2ms(stamp: number | string): number {
  if (typeof stamp !== "number" && typeof stamp !== "string") return 0

  stamp = stamp.toString().slice(0, 13)
  while (stamp.length < 13) {
    stamp += "0"
  }

  return Number(stamp)
}

export function dateParse(input: Date): DateAttrs | null {
  if ((input instanceof Date) === false) return null

  const year = input.getFullYear()
  const month = input.getMonth()
  const date = input.getDate()
  const hour = input.getHours()
  const minute = input.getMinutes()
  const second = input.getSeconds()
  const day = input.getDay()
  const monthDays = new Date(year, month + 1, 0, 0, 0, 0).getDate()
  const stamp = input.getTime()

  return {
    year,
    month,
    date,
    hour,
    minute,
    second,
    day,
    monthDays,
    stamp
  }
}

export function format(input: Date, rule = "YYYY/MM/DD"): string {
  const attrs = dateParse(input)
  if (!attrs) return ""

  let _string = rule.replace(/(^\s+)|(\s+$)/g, "")

  const formats: [RegExp, number | string][] = [
    [/Y{4,}/, attrs.year],
    [/Y{2,}/, attrs.year.toString().substr(2)],
    [/M{2,}/, numberStringify(attrs.month + 1)],
    [/M/, attrs.month + 1],
    [/D{2,}/, numberStringify(attrs.date)],
    [/D/, attrs.date],
    [/h{2,}/, numberStringify(attrs.hour)],
    [/h/, attrs.hour],
    [/m{2,}/, numberStringify(attrs.minute)],
    [/m/, attrs.minute],
    [/s{2,}/, numberStringify(attrs.second)],
    [/s/, attrs.second]
  ]

  formats.forEach(([reg, value]) => {
    _string = _string.replace(reg, value.toString())
  })

  return _string
}

export function string2date(input: string, rule = "YYYY/MM/DD") {
  const nums = input.match(/\d+/g) || []
  const splits = rule.match(/[YMDhms]+/g) || []

  const part: {[x:string]: number} = { "Y": 0, "M": 1, "D": 1, "h": 0, "m": 0, "s": 0 }

  splits.forEach((item, index) => {
    Object.keys(part).forEach((key) => {
      if (item.startsWith(key)) {
        part[key] = Number(nums[index]) || 0
      }
    })
  })

  return new Date(part.Y, part.M - 1, part.D, part.h, part.m, part.s)
}