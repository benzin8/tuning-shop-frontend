import { RotateCcw, CheckCircle, XCircle, Phone } from 'lucide-react'

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

export default function Returns() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Возврат</h1>

      <div className="flex flex-col gap-4">
        <Section icon={RotateCcw} title="Условия возврата">
          <p>Возврат товара надлежащего качества возможен в течение <span className="text-gray-200 font-medium">14 дней</span> с момента получения при соблюдении следующих условий:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>товар не был в употреблении</li>
            <li>сохранены оригинальная упаковка и комплектация</li>
            <li>сохранены все ярлыки и пломбы</li>
            <li>есть документы, подтверждающие покупку</li>
          </ul>
        </Section>

        <Section icon={CheckCircle} title="Можно вернуть">
          <p>Запчасти и аксессуары, не подошедшие по техническим характеристикам — при условии, что товар не устанавливался и не имеет следов монтажа.</p>
          <p>Товар с производственным браком возвращается или обменивается в течение <span className="text-gray-200 font-medium">30 дней</span> без дополнительных условий.</p>
        </Section>

        <Section icon={XCircle} title="Нельзя вернуть">
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>товары, изготовленные под заказ</li>
            <li>установленные или имеющие следы монтажа запчасти</li>
            <li>товары с нарушенной упаковкой (расходники, жидкости, фильтры)</li>
          </ul>
        </Section>

        <Section icon={Phone} title="Как оформить возврат">
          <p>Свяжитесь с нами удобным способом — менеджер оформит заявку и сообщит адрес для отправки.</p>
          <p>После получения товара и проверки его состояния возврат средств осуществляется в течение <span className="text-gray-200 font-medium">7 рабочих дней</span> тем же способом, которым была произведена оплата.</p>
        </Section>
      </div>
    </div>
  )
}
