import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers
let source=URL(fileURLWithPath:CommandLine.arguments[1]),destination=URL(fileURLWithPath:CommandLine.arguments[2])
guard let input=CGImageSourceCreateWithURL(source as CFURL,nil),let image=CGImageSourceCreateImageAtIndex(input,0,nil),
 let context=CGContext(data:nil,width:image.width,height:image.height,bitsPerComponent:8,bytesPerRow:0,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.noneSkipLast.rawValue) else { fatalError("App icon could not be decoded") }
context.draw(image,in:CGRect(x:0,y:0,width:image.width,height:image.height))
guard let opaque=context.makeImage(),let output=CGImageDestinationCreateWithURL(destination as CFURL,UTType.png.identifier as CFString,1,nil) else { fatalError("App icon could not be encoded") }
CGImageDestinationAddImage(output,opaque,nil)
guard CGImageDestinationFinalize(output) else { fatalError("App icon write failed") }
