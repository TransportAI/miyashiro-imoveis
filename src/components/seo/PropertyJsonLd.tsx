import React from "react";
import { Property } from "@/lib/types";

interface PropertyJsonLdProps {
  property?: Property;
}

export default function PropertyJsonLd({ property }: PropertyJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://miyashiroimoveis.com.br";

  // Schema institucional do Corretor / Imobiliária (RealEstateAgent)
  const agencySchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Miyashiro Imóveis",
    "image": `${baseUrl}/images/brand/logo.png`,
    "description": "Imobiliária tradicional em Amparo e Circuito das Águas Paulista. Venda, locação e administração de casas, chácaras e apartamentos de alto padrão.",
    "url": baseUrl,
    "telephone": "+5519993673949",
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rua Ana Cintra, 246",
      "addressLocality": "Amparo",
      "addressRegion": "SP",
      "postalCode": "13900-011",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -22.7031,
      "longitude": -46.7642
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:30",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "12:30"
      }
    ]
  };

  // Se for página de imóvel específico, gera o Schema do Imóvel (SingleFamilyResidence / RealEstateListing)
  let listingSchema = null;
  if (property) {
    listingSchema = {
      "@context": "https://schema.org",
      "@type": "SingleFamilyResidence",
      "name": property.title,
      "description": property.description,
      "url": `${baseUrl}/imovel/${property.slug}`,
      "image": property.images?.map(img => img.startsWith("http") ? img : `${baseUrl}${img}`) || [],
      "numberOfRooms": property.bedrooms,
      "numberOfBedrooms": property.bedrooms,
      "numberOfBathroomsTotal": property.bathrooms,
      "floorSize": {
        "@type": "QuantitativeValue",
        "value": property.areaBuilt || property.areaTotal,
        "unitCode": "MTK"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": property.address?.city || "Amparo",
        "addressRegion": "SP",
        "addressCountry": "BR"
      },
      "offers": {
        "@type": "Offer",
        "price": property.price,
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "businessFunction": property.purpose === "aluguel" ? "https://schema.org/LeaseOut" : "https://schema.org/Sell"
      }
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(agencySchema) }}
      />
      {listingSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
        />
      )}
    </>
  );
}
