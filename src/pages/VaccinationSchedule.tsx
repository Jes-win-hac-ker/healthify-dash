import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, Syringe, Activity, Ear, Eye } from "lucide-react";

interface VaccineScheduleItem {
  age: string;
  vaccines: string;
}

const vaccineSchedule: VaccineScheduleItem[] = [
  { age: "Birth", vaccines: "Hepatitis B" },
  { age: "3-5 days", vaccines: "Well-Child Visit" },
  { age: "7-14 days", vaccines: "Well-Child Visit" },
  { age: "2 months", vaccines: "DTaP, Hep B, Hib, PCV, Rotavirus, IPV" },
  { age: "4 months", vaccines: "DTaP, Hib, PCV, Rotavirus, IPV" },
  { age: "6 months", vaccines: "DTaP, Hep B, PCV, Hib (if needed), Rotavirus, IPV" },
  { age: "9 months", vaccines: "Well-Child Visit" },
  { age: "12 months", vaccines: "MMR, Hepatitis A, Varicella, Hib, PCV" },
  { age: "15-18 months", vaccines: "DTaP" },
  { age: "2 years", vaccines: "Hep A" },
  { age: "3 years", vaccines: "Well-Child Visit" },
  { age: "4 years", vaccines: "DTaP, IPV, Varicella, MMR (+ Hearing & Vision Screen)" },
  { age: "5 years", vaccines: "Well-Child Visit" },
  { age: "6, 8, and 10 years", vaccines: "Well-Child Visit" },
  { age: "11 years", vaccines: "HPV (in 3 doses across a 6 month span), Tdap booster, MCV" },
  { age: "12 years", vaccines: "Well-Child Visit" },
  { age: "13 years", vaccines: "Varicella blood test, if vaccine not given and no history of chickenpox" },
  { age: "14 and 15 years", vaccines: "Well-Child Visit" },
  { age: "16 years", vaccines: "MCV booster" },
  { age: "17 years", vaccines: "Well-Child Visit" },
];

export default function VaccinationSchedule() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-teal-50">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img 
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='80' viewBox='0 0 200 80'%3E%3Ctext x='10' y='40' font-family='Arial' font-size='16' font-weight='bold' fill='%234299e1'%3EWELL-CHILD VISITS %26 VACCINATIONS%3C/text%3E%3Ctext x='10' y='65' font-family='Arial' font-size='12' fill='%23718096'%3EChildren from Birth-17 Years Old%3C/text%3E%3C/svg%3E"
                alt="Well-Child Visits & Vaccinations"
                className="mb-4"
              />
            </div>
            <div className="flex justify-center space-x-4 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mb-2">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-medium">Well-Child Visit</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-medium">Blood Screen</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                  <Syringe className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-medium">Vaccination</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
                  <Ear className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-medium">Hearing Screen</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-2">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <span className="text-xs font-medium">Vision Screen</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Recommended Vaccines & Tests</CardTitle>
            <CardDescription>Age-based vaccination schedule for children</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-700 text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">AGE</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">RECOMMENDED VACCINES & TESTS</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccineSchedule.map((item, index) => (
                    <tr 
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700">
                        {item.age}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-2">
                          {item.vaccines.toLowerCase().includes('well-child') && (
                            <Activity className="w-5 h-5 text-teal-500 flex-shrink-0" />
                          )}
                          {(item.vaccines.toLowerCase().includes('dtap') || 
                            item.vaccines.toLowerCase().includes('hep') ||
                            item.vaccines.toLowerCase().includes('mmr') ||
                            item.vaccines.toLowerCase().includes('hib') ||
                            item.vaccines.toLowerCase().includes('pcv') ||
                            item.vaccines.toLowerCase().includes('ipv') ||
                            item.vaccines.toLowerCase().includes('rotavirus') ||
                            item.vaccines.toLowerCase().includes('varicella') ||
                            item.vaccines.toLowerCase().includes('hpv') ||
                            item.vaccines.toLowerCase().includes('tdap') ||
                            item.vaccines.toLowerCase().includes('mcv')) && (
                            <Syringe className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          )}
                          {item.vaccines.toLowerCase().includes('blood') && (
                            <Activity className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                          {item.vaccines.toLowerCase().includes('hearing') && (
                            <Ear className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                          )}
                          {item.vaccines.toLowerCase().includes('vision') && (
                            <Eye className="w-5 h-5 text-green-600 flex-shrink-0" />
                          )}
                          <span>{item.vaccines}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-xs text-gray-500 text-center">
              <p>Source: American Academy of Pediatrics</p>
              <p className="mt-2">Always consult with your healthcare provider for personalized recommendations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
