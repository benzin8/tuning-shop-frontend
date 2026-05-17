import { Truck, Clock, MapPin, CreditCard } from 'lucide-react'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-orange-400" />
        </div>
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
      <div className="text-sm text-gray-400 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

export default function Delivery() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Доставка</h1>

      <div className="flex flex-col gap-4">
        <Section icon={Truck} title="Способы доставки">
          <p><span className="text-gray-200 font-medium">Курьером по городу</span> — доставка в течение 1–2 рабочих дней. Стоимость рассчитывается при оформлении заказа.</p>
          <p><span className="text-gray-200 font-medium">Транспортная компания</span> — доставка по России через СДЭК, Boxberry или Почту России. Срок — 3–10 рабочих дней в зависимости от региона.</p>
          <p><span className="text-gray-200 font-medium">Самовывоз</span> — бесплатно. Адрес и время работы пункта выдачи уточняйте у менеджера.</p>
        </Section>

        <Section icon={Clock} title="Сроки">
          <p>Заказы, оформленные до 14:00 в рабочий день, передаются в доставку в тот же день.</p>
          <p>Заказы после 14:00 или в выходные — на следующий рабочий день.</p>
          <p>Крупногабаритные запчасти и заказы под заявку могут потребовать дополнительного времени — менеджер свяжется с вами для уточнения.</p>
        </Section>

        <Section icon={MapPin} title="География доставки">
          <p>Доставляем по всей России. Для отдельных регионов возможны ограничения — уточняйте при оформлении.</p>
        </Section>

        <Section icon={CreditCard} title="Стоимость">
          <p>При заказе от <span className="text-orange-400 font-medium">10 000 ₽</span> доставка по городу бесплатна.</p>
          <p>Стоимость доставки в другие регионы рассчитывается индивидуально в зависимости от веса, габаритов и дальности.</p>
        </Section>
      </div>
    </div>
  )
}
