/* ---------------- UI Components ---------------- */
import { useState, type ReactNode } from "react";
import { Upload, ChevronDown } from "lucide-react";

export function Section(
  props: Readonly<{ title: string; children: ReactNode; icon?: ReactNode }>
) {
  const { title, children, icon } = props;
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function Uploader(props: Readonly<{ onFile: (f: File) => void }>) {
  const { onFile } = props;
  return (
    <label className="h-16 flex items-center gap-3 px-3 cursor-pointer rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 bg-gray-50">
      <div className="h-10 w-14 bg-gray-200 rounded-md" />
      <span className="text-gray-600">Upload Image</span>
      <Upload size={16} className="ml-auto text-gray-400" />
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.currentTarget.value = "";
        }}
      />
    </label>
  );
}

export function NavItem({
  text,
  active = false,
  color = "#673CCB",
  className = "",
}: {
  text: string;
  active?: boolean;
  color?: string;
  className?: string;
}) {
  return (
    <button
      className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium ${className} ${
        active ? "text-white" : "text-gray-700"
      }`}
      style={{
        background: active ? color : "#EDF3F7",
      }}
    >
      {text}
    </button>
  );
}


export function Tab({
  children,
  active = false,
  color = "#B18FFF",
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  color?: string;
  onClick?: () => void;
}) {
  const base = "px-4 h-9 rounded-full text-sm font-medium transition";
  return (
    <button
      onClick={onClick}
      className={base}
      style={{
        backgroundColor: active ? color : "#FFFFFF",
        border: active ? "none" : `2px solid ${color}`,
        color: active ? "#FFFFFF" : color, 
      }}
    >
      {children}
    </button>
  );
}


/* ---------------- Dropdown Component ---------------- */
export function RestaurantDropdown({ currentName }: { currentName: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 shadow-sm hover:bg-gray-50"
      >
        <span className="text-gray-700">{currentName}</span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <div className="px-3 py-2 text-sm font-medium text-gray-900 border-l-2 border-[#673CCB] bg-purple-50">
              {currentName}
            </div>
            <div className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
              + Add Restaurant
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
